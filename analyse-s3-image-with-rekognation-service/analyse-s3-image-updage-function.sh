REST_LAMBDA_NAME="analyse-s3-image-with-rekognation-service"

echo "removing existing zip"
rm -f ./$REST_LAMBDA_NAME.zip
echo "file zipping.."
zip $REST_LAMBDA_NAME.zip index.mjs


aws lambda update-function-code --function-name "${REST_LAMBDA_NAME}" --zip-file "fileb://${REST_LAMBDA_NAME}.zip" --region "eu-central-1" --profile "cloud-formation"
