import { KinesisVideoArchivedMediaClient, GetImagesCommand } from "@aws-sdk/client-kinesis-video-archived-media";
import { GetDataEndpointCommand } from "@aws-sdk/client-kinesis-video";

const client = new KinesisVideoArchivedMediaClient({
  apiVersion: "2017-09-30",
  region: "eu-central-1",
  credentials: {},
});

const one = async (event) => {
  const endpoint = new GetDataEndpointCommand({
    APIName: "GET_IMAGES",
    StreamName: "traffic_stream",
  });

  const { DataEndpoint } = await client.send(endpoint);

  console.log(DataEndpoint);

  const startTimeStamp = 1672468589000;
  const endTimeStamp = 1672468709000;

  const input = {
    EndTimestamp: new Date(endTimeStamp),
    Format: "JPEG",
    ImageSelectorType: "SERVER_TIMESTAMP",
    SamplingInterval: 3000,
    StartTimestamp: new Date(startTimeStamp),
    StreamName: "traffic_stream",
  };

  client.config.endpoint = DataEndpoint;

  const command = new GetImagesCommand(input);
  const res = await client.send(command);

  const Images = res.Images;
  const filtered = Images.map((item) => item.ImageContent).filter((item) => typeof item !== "undefined");

  console.log(filtered);

  return filtered;
  // return formatJSONResponse({
  //   message: 'success',
  //   event,
  // });
};

one();
