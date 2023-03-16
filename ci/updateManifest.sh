#!/bin/sh
set -xe

apk add bash && apk add git && apk add --update curl && rm -rf /var/cache/apk/*

# clone repo manifest
git clone "https://${PERSONAL_ACCESS_TOKEN}@${REPO_MANIFEST_URL}"
cd ./${REPO_MANIFEST_NAME}
git checkout ${REPO_MANIFEST_BRANCH} && git pull

if [ ${GITHUB_REF_NAME} = "main" ]
then
  echo 'This is main branch'
  cd ${REPO_MANIFEST_ENV_MAIN}
elif [ ${GITHUB_REF_NAME} = "develop" ]
then
  echo 'This is dev branch'
  cd ${REPO_MANIFEST_ENV_DEV}
elif [ ${GITHUB_REF_NAME} = "staging" ]
then
  echo 'This is staging branch'
  cd ${REPO_MANIFEST_ENV_STAGING}
elif [ ${GITHUB_REF_NAME} = "euphoria" ]
then
  echo 'This is euphoria branch'
  cd ${REPO_MANIFEST_ENV_EUPHORIA}
elif [ ${GITHUB_REF_NAME} = "serenity" ]
then
  echo 'This is serenity branch'
  cd ${REPO_MANIFEST_ENV_SERENITY}
elif [ ${GITHUB_REF_NAME} = "halo" ]
then
  echo 'This is halo branch'
  cd ${REPO_MANIFEST_ENV_HALO}
else
  exit
fi

# kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
./kustomize edit set image ${REPO_MANIFEST_TAG_IMAGE}=${CONTAINER_RELEASE_IMAGE}
rm kustomize

git config --global user.name "${GITHUB_ACTOR}"
git config --global user.email "user@aura.network"
git add . 
git commit -m "Update image to ${CONTAINER_RELEASE_IMAGE}"
git push
