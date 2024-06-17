#!/bin/sh
set -xe

#Login to registry
echo $GITHUB_PASSWORD | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
if [ ${GITHUB_REF_NAME} = "main" ]
then
    echo 'This is main branch'
fi
#Build and push image
docker build -t ${CONTAINER_RELEASE_IMAGE} --build-arg SHORT_SHA_COMMIT=${SHORT_SHA_COMMIT} --build-arg ENVIRONMENT=${ENVIRONMENT} -f Dockerfile .
docker push ${CONTAINER_RELEASE_IMAGE}
