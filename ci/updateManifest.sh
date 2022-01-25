#!/bin/sh
set -xe

apk add bash && apk add git && apk add --update curl && rm -rf /var/cache/apk/*

# config git
mkdir -p ~/.ssh
echo "${SSH_KEY_GITOPS}" >> id_rsa
echo '-----BEGIN RSA PRIVATE KEY-----' >> ~/.ssh/id_rsa
sed -e "s/\S\{64\}/&\n/g" id_rsa >> ~/.ssh/id_rsa
echo '-----END RSA PRIVATE KEY-----' >> ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
ssh-keyscan -H 'gitlab.com' >> ~/.ssh/known_hosts

# clone repo manifest
git clone ${REPO_MANIFEST_URL}
cd ./${REPO_MANIFEST_NAME}
git checkout ${REPO_MANIFEST_BRANCH} && git pull

if [ ${CI_COMMIT_REF_NAME} = "master" ]
then
  echo 'This is master branch'
elif [ ${CI_COMMIT_REF_NAME} = "develop" ]
then
  echo 'This is develop branch'
  cd ${REPO_MANIFEST_ENV_DEV}
elif [ ${CI_COMMIT_REF_NAME} = "qa" ]
then
  echo 'This is qa branch'
  cd ${REPO_MANIFEST_ENV_QA}
elif [ ${CI_COMMIT_REF_NAME} = "uat" ]
then
  echo 'This is uat branch'
  cd ${REPO_MANIFEST_ENV_UAT}
else
  exit
fi

# kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
./kustomize edit set image ${REPO_MANIFEST_TAG_IMAGE}=${CONTAINER_RELEASE_IMAGE}
rm kustomize

git config --global user.email "${GITLAB_USER_EMAIL}"
git config --global user.name "${GITLAB_USER_NAME}"
git add . 
git commit -m "Update image to ${CONTAINER_RELEASE_IMAGE}"
git push
