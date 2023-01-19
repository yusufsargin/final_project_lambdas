
echo "Deploy Lambda function to S3"
echo "Zipping File.."
zip analyse-s3-image-with-rekognation-service.zip analyse-s3-image-with-rekognation-service.js

echo "check is function exists"
aws lambda function-exists --function-name analyse-s3-image-with-rekognation-service

aws cloudformation delete-stack --stack-name finalProjectStack --profile cloud-formation &&
    aws cloudformation deploy --stack-name finalProjectStack --template-file ./aws-resources.yaml --profile cloud-formation
