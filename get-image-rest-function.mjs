import {GetObjectCommand, ListObjectsV2Command, S3Client} from '@aws-sdk/client-s3'
import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import {BatchGetCommand, DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

const REGION = "eu-central-1"
const BUCKET_NAME = "kvs-images";
const TABLE_NAME="detect-app-results"
export const handler = async (event) => {
    const startTime = event["queryStringParameters"].startTime;
    const s3Client = new S3Client({
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


    const {Contents} = await s3Client.send(new ListObjectsV2Command({
        Prefix: "image_" + startTime.slice(0, -6),
        Bucket: BUCKET_NAME,
        MaxKeys: 10
    }))

    const keyList = Contents.map(item => ({
        id:item.Key
    }));
    const dynamoQuery = {
        [TABLE_NAME]:{
            Keys:keyList
        }
    }

    const {Responses} = await ddbDocClient.send(new BatchGetCommand({
        RequestItems:dynamoQuery
    }))

    return {
        statusCode: 200,
        body: JSON.stringify(Responses[TABLE_NAME]),
    };
};
