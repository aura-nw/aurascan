#!/bin/sh
set -xe

#Login to registry
docker login -u gitlab-ci-token -p $CI_JOB_TOKEN $CI_REGISTRY

#Build and push image
docker build -t ${CONTAINER_RELEASE_IMAGE} -f Dockerfile .
docker push ${CONTAINER_RELEASE_IMAGE}
