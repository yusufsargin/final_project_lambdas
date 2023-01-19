REST_LAMBDA_NAME="save-kvs-images-to-s3"

echo "removing existing zip"
rm -f ./$REST_LAMBDA_NAME.zip
echo "file zipping.."
zip $REST_LAMBDA_NAME.zip index.mjs


aws lambda update-function-code --function-name "${REST_LAMBDA_NAME}" --zip-file "fileb://${REST_LAMBDA_NAME}.zip" --region "eu-central-1" --profile "cloud-formation"
