import { DetectLabelsCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = "eu-central-1";
const TableName = "detect-app-results";

const selected_labels = ["Car", "Person", "Face"];

function collectSelectedItemCount(labels = [], selectedLabel = "Car") {
  if (labels.length === 0) {
    return 0;
  }

  let count = 0;

  labels.map((label) => {
    if (label.Name === selectedLabel) {
      count = label.Instances.length || 0;
    }
  });

  return count;
}

export const handler = async (event, context) => {
  const rekognitionClient = new RekognitionClient({
    region: REGION,
  });
  const dynamoDbClient = new DynamoDBClient({
    region: REGION,
  });
  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  };

  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  };
  const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
    marshallOptions,
    unmarshallOptions,
  });

  const BUCKET_IMAGES = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  const rekognitionParams = {
    Image: {
      S3Object: {
        Bucket: BUCKET_IMAGES,
        Name: key,
      },
    },
  };

  try {
    const { Labels: labels } = await rekognitionClient.send(new DetectLabelsCommand(rekognitionParams));

    const map = new Map();

    selected_labels.map((item) => {
      map.set(item, collectSelectedItemCount(labels, item));
    });

    const saveObject = {
      TableName,
      Item: {
        id: key,
        labels,
        car_count: map.get("Car"),
        person_count: map.get("Person"),
        face_count: map.get("Face"),
      },
    };

    await ddbDocClient.send(new PutCommand(saveObject));

    return {
      status: 200,
      body: labels,
    };
  } catch (error) {
    console.error("there is an error", error);
    return {
      status: 500,
      body: error,
    };
  }
};
