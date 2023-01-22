# Final Project Lambda Functions

#### This is the main repo you can go whatever you need from this repo.

In order to run these command you need to create functions below in the AWS console

`analyse-s3-image-with-rekognation-service`
`get-image-rest-function`
`save-kvs-images-to-s3`

When completed to create of these function, you can run `yarn update-all` command in CLI. This command will help you to update codes in the created function. 

You almost ready for run application.

You have two mission to work app. First, you should visit the  `save-kvs-images-to-s3` function in console and create `EventBridge` function for this function. Your created event should trigger lambda every 5 min.

After trigger save function, Lastly, you need to create a trigger for `analyse-s3-image-with-rekognation-service` function. You should add s3 PutImage trigger for this lambda.

Yes, you are ready, you can see the result with running codes in [this repo](https://github.com/yusufsargin/final_project_fe). 


## Produce Video Stream For App

In order to produce stream to the AWS, you need to clone [this repo](https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp) and run code below. It'll get video from near webcam.

````shell
gst-launch-1.0 avfvideosrc do-timestamp=TRUE device-index=0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! x264enc bframes=0 key-int-max=45 bitrate=500 ! video/x-h264,stream-format=avc,alignment=au,profile=baseline ! kvssink stream-name=${KINESIS-VIDEO-NAME} storage-size=512 access-key=${AWS-ACCESSKEY} secret-key=${AWS-SECRETKEY} aws-region=${KINESIS-REGION}
````

This code work only the MAC system. In order to run in different system you need to inspect [this page](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/examples-gstreamer-plugin.html)
