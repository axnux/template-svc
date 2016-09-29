## Wercker continuous delivery workflow
We have created a continuous delivery workflow as below:

![Imgur](http://i.imgur.com/0qfoMaB.png)

Here is what happens in the pipelines:

1. build
    - npm install
    - unit test

2. the following pipelines will run concurrently and each of these will start with loading environment variables using `env-provisioner.sh` (see below)
    - build docker image for development use -> deploy to kubernetes
    - rebuild for npm for production use -> build docker image for production use -> deploy to kubernetes
    - update test coverage report and api docs to s3


*Fetch env vars provisioner script*

  - load the **MASTER_S3_CONFIG** from env vars (wercker dashboard)
  - fetch `default-env-vars.sh` from s3
  - cache it as `env-provisioner.sh`


### Workflow setup
1. Configure `config/container_env/env-provisioner.sh.sample`, and store it as `default-env-vars.sh` in your s3 bucket (root level).
   You can then expose the common environment variables to wercker steps as below.

   ![Imgur](http://i.imgur.com/KgioS8S.png)

2. Copy `config/container_env/master.s3.config.sample` as `config/container_env/master.s3.config`. *Don't worry this file would not be stored in git*
  Open it and configure it with the your s3 credentials to access the `default-env-vars.sh` that you created in **step 1**.

3. Execute the following command in your project directory.
   You should be seeing a long and random string. copy the value.
  ```shell
  # cd to/your/current/project/directory
  echo $(cat config/container_env/master.s3.config | base64)
  ```
  Then go to wercker dashboard look for the section 'Environment'.
  Create a new environment variable called **MASTER_S3_CONFIG** and paste the value that you copied earlier into the 'value' column.
  *note: It is a `base64` encoded s3 credentials that will be used in the custom wercker step to fetch the `default-env-vars.sh` from s3. This script will export a list of common environment variables to the wercker processes.  *

  ![Imgur](http://i.imgur.com/9JZwuCI.png)

4. There is a few more wercker related environment variable that you have to configure from the **Wercker Dashboard**.
Below is a list of available environment variables that are required by the pipelines such as build, test, deploy, etc.
Note: For the application level env vars see [this](#application-env-vars-for-deployment).

| Environment Variables | Description |
| --------------------- | ----------- |
| DEPLOY_SERVICE_PORT   | Optional. port number to access this service. default to `2200` |
| DEPLOY_IMAGE_TAG   | optional. docker image tag. default to `development` |
| DEPLOY_IMAGE_PULL_SECRET   | optional. if you are using image pull secrets please refer to [k8s image pull secrets](http://kubernetes.io/docs/user-guide/images/#using-a-private-registry) |
| DOCKER_USERNAME   | optional. if you are using docker hub. eg: `axnux` |
| DOCKER_PASSWORD   | optional. if you are using docker hub. |
| DOCKER_REPO   | **Require**. eg: `template-svc` |


### Application Env Vars for Deployment
There are few ways to set environment variables for Kubernetes pods (or container):

1. **Option One** Set env vars in Wercker dashboard.
 For instance, if your application config requires a environment variables called *S3_REGION*
 then you can set the *S3_REGION* in wercker dashboard:

  ![Imgur](http://i.imgur.com/A5iq1jF.png)

2. **Option Two** Set env vars in kubernetes configmap,
 then load it into the deployment file `deploy/service-template.yml`. [Learn more](http://kubernetes.io/docs/user-guide/configmap/#use-case-consume-configmap-in-environment-variables)

3. **Option Three** (not recommended) Set env vars into Docker image itself.
For instance, if your application config requires a environment variables called *S3_REGION*
then you can set the *TEMPLATE_AWS_S3_REGION* in wercker dashboard.
And refer it at the *env* section in `wercker.yml` as below (same goes to other env vars):

  ![Imgur](http://i.imgur.com/nmwYhbK.png)



### More about `deploy/service-template.yml`
If you do not wish to expose your service to the public, just remove
`type: LoadBalancer` from it.

If you are using aws ecr private registry, please update the `deploy/service-template.yml` and `wercker.yml` accordingly.

If you are using private repositories please uncomment

```yml
...

imagePullSecrets:
  - name: {{DEPLOY_IMAGE_PULL_SECRET}}
```
