#!/bin/bash

folderName=$(cd $(dirname $BASH_SOURCE) && pwd)
if [ -f "$folderName/../../config/container_env/master.s3.config" ]; then
  MASTER_S3_CONFIG="$(echo "$(cat $folderName/../../config/container_env/master.s3.config | base64)")"
fi
MASTER_S3_CONFIG_CSV=$(echo "$MASTER_S3_CONFIG" | base64 --decode)
MASTER_S3_CONFIG_ACCESS_KEY_ID=${MASTER_S3_CONFIG_ACCESS_KEY_ID=$(echo $MASTER_S3_CONFIG_CSV | cut -d "," -f 1)}
MASTER_S3_CONFIG_SECRET_ACCESS_KEY=${MASTER_S3_CONFIG_SECRET_ACCESS_KEY=$(echo $MASTER_S3_CONFIG_CSV | cut -d "," -f 2)}
MASTER_S3_CONFIG_REGION=${MASTER_S3_CONFIG_REGION=$(echo $MASTER_S3_CONFIG_CSV | cut -d "," -f 3)}
MASTER_S3_CONFIG_BUCKET=${MASTER_S3_CONFIG_BUCKET=$(echo $MASTER_S3_CONFIG_CSV | cut -d "," -f 4)}
MASTER_S3_CONFIG_ENV_SH=${MASTER_S3_CONFIG_ENV_SH=$(echo $MASTER_S3_CONFIG_CSV | cut -d "," -f 5)}
