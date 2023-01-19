import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

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
      count++;
    }
  });

  return count;
}

async function getItem() {
  const dynamoDbClient = new DynamoDBClient({
    region: REGION,
    credentials: {},
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

  const data = await ddbDocClient.send(
    new GetCommand({
      TableName,
      Key: {
        id: "image_1673087220000",
      },
    })
  );

  const { labels } = data.Item;

  const map = new Map();

  selected_labels.map((item) => {
    map.set(item, collectSelectedItemCount(labels, item));
  });

  const saveObject = {
    TableName,
    Item: {
      id: key,
      labels: Labels,
      car_count: map.get("Car"),
      person_count: map.get("Person"),
      face_count: map.get("Face"),
    },
  };
}

getItem();
