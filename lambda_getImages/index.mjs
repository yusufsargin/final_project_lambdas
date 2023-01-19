import { KinesisVideoArchivedMediaClient, GetImagesCommand } from "@aws-sdk/client-kinesis-video-archived-media";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const REGION = "eu-central-1";
const BUCKET_NAME = "kvs-images";

const uploadToS3 = async (client, base64Image, timeStamp) => {
  console.log("upload image", base64Image);
  const buf = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");

  return await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "image_" + new Date(timeStamp).getTime(),
      Body: buf,
      ContentEncoding: "base64",
      ContentType: "image/jpeg",
    })
  );
};

export const handler = async (event) => {
  const client = new KinesisVideoArchivedMediaClient({
    apiVersion: "2017-09-30",
    region: REGION,
    endpoint: "https://b-e60d19d8.kinesisvideo.eu-central-1.amazonaws.com/",
  });
  const s3Client = new S3Client({
    region: REGION,
  });

  const LAST_5_MIN = 5;
  const endDate = new Date();

  const start_time = new Date(endDate.getTime());

  start_time.setMinutes(endDate.getMinutes() - LAST_5_MIN);

  const input = {
    EndTimestamp: endDate,
    Format: "JPEG",
    ImageSelectorType: "SERVER_TIMESTAMP",
    SamplingInterval: 3000,
    StartTimestamp: start_time,
    StreamName: "traffic_stream",
  };

  const command = new GetImagesCommand(input);
  const res = await client.send(command);

  const Images = res.Images;
  const filtered = Images.filter((item) => item.ImageContent);

  // Upload images to s3
  for (let i = 0; i < filtered.length; i++) {
    const { ImageContent, TimeStamp } = filtered[i];

    const response = await uploadToS3(s3Client, ImageContent, TimeStamp);

    console.log("response", response);
  }

  return filtered;
};
