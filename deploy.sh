bucket_name="alexa-lambdas-test"
aws_region="us-west-2"
zip_file=alexa-my-calendar.zip

#!/bin/bash

echo "Removing old lambda zip file ..."

rm $zip_file

echo "Generating new lambda zip file ..."

cd lambda;
zip -r ../$zip_file *;
cd ..

echo "Sending zip lambda files to s3 ..."

aws s3 mb s3://$bucket_name --region $aws_region

set -e

aws s3 cp $zip_file s3://$bucket_name/$zip_file --region $aws_region

