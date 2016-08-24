# Microservices Starter template [![wercker status](https://app.wercker.com/status/3990bf39fc888c44f5cd6821df712c87/s "wercker status")](https://app.wercker.com/project/bykey/3990bf39fc888c44f5cd6821df712c87) [![Dependency Status](https://gemnasium.com/badges/github.com/axnux/template-svc.svg)](https://gemnasium.com/github.com/axnux/template-svc)

An *experimental* nodejs BDD scaffolding for microservices

Support for **Docker** through **Wercker**

## Start development with local nodejs (recommended)
### Prerequisites  
- nodejs  

### Instructions  
1. First install the dependencies using `npm install`  
2. To start with development, you have 3 options:  
   - **LOCAL** - execute `npm run dev` and keep it running in terminal  
       *Note: this start your web app at port 3000 by default.*  
       *every time you update your js files. it will auto re-run this.*  
   - **DEBUG** - execute `npm run dev:debug` and keep it running in terminal  
       *Note: same as the above local mode*  
       *Open debug console at* `http://127.0.0.1:1337/?port=5858`  
   - **BDD** - execute `npm run bdd` and keep it running in terminal  
       *Note: this will not start your web app but continuous testing.*  
       *every time you update your js files. it will auto restart test cases.*  

## Alternatives (using Wercker)
### Prerequisites  
- docker for Mac/Windows/Linux (*or virtualbox 5.0.20 + boot2docker-vagrant*)  
- wercker cli  

### Wercker dev
For some reason you might don't want to use nodejs in your local machine.   
Then you can still start development using **wercker cli**:

1. To start with development using **wercker**  
    execute `wercker dev --expose-ports=true`   
     (same as using the recommended *DEBUG* mode above)    
     *Open debug console at* `http://DOCKER_HOST_IP:1337/?port=5858`   
2. If you would like to do **BDD** please refer to `wercker.yml`  

```yml
dev:
  steps:
    #
    # ...
    #
    # make sure this part is commented out
    # - script:
    #     name: start dev environment
    #     code: npm run dev:debug

    # make sure the code below is not commented
    - script:
        name: start bdd environment
        code: npm run bdd
```  

### Wercker build
1. To push the development container to docker.  
   Modify the`wercker.yml` as below  

  ```yml
  build:
    steps:

      # make sure the code below is not commented  
      - script:
          name: set deploy image repository
          code: export DEPLOY_IMAGE_REPO=${DEPLOY_IMAGE_REPO="$DOCKER_USERNAME/$DOCKER_REPO"}
      - internal/docker-push:
          username: $DOCKER_USERNAME  # replace DOCKER_USERNAME with your docker hub user name
          password: $DOCKER_PASSWORD  # replace DOCKER_PASSWORD with your docker hub password
          repository: $DEPLOY_IMAGE_REPO # replace DOCKER_REPO with your docker hub registries name. eg: sample-svc
          working-dir: $WERCKER_SOURCE_DIR
          entrypoint: gulp dev --debug
          tag: debug-build
          ports:
             - "3000"  # nodejs port
             - "1337"  # chrome UI for debugging
             - "5858"  # port for node-inspector debugging socket

  ```

2. Make sure setting up **X_DOCKER_USERNAME**, **X_DOCKER_PASSWORD**, **X_DOCKER_REPO** in the local.env file  
Then execute the following command in terminal
`wercker --environment config/container_env/local.env build`  
*OR*  
Make sure the **$DOCKER_USERNAME**, **$DOCKER_PASSWORD** and **$DOCKER_REPO** are replaced with actual value.  
Then execute `wercker build` in terminal  

3. If you wish to load environment variables into `wercker.yml` , you could copy `config/container_env/local.env.sample` and paste/rename it as `config/container_env/local.env`.  *Don't worry this file would not be stored in git*  
All environment variables (with prefix `X_`) from the file will be made available (access without `X_`) to `wercker.yml`. For example, `X_DOCKER_REPO` will become `DOCKER_REPO` in the `wercker.yml`.  [Learn more](http://devcenter.wercker.com/cli/configuration/environment-variables.html)  
Then execute the following command:  

```shell
wercker --environment config/container_env/local.env build
# OR
wercker --environment config/container_env/local.env dev
```


## Logging

```js
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
winston.warn('something might go wrong')
winston.error('something went wrong')
```


## Folder structures
1. Business logics in **src**  
2. API routes in **src/SERVICE_NAME/routes**   
3. Test cases in **test**  
4. API doc & Test coverage report **docs**  
5. Configuration files for various environments **config/env**  
6. Configuration file that sit in your local machine only **config/env/local/default.js**  
7. Environment variable for wercker runtime **config/container_env**  


## Wercker workflow
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

   ![Imgur](http://i.imgur.com/ACaS1Bv.png)

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

  ![Imgur](http://i.imgur.com/CHKujY8.png)  

4. There is a few more wercker related environment variable that you have to configure from the **Wercker Dashboard**.   
Below is a list of available environment variables that are required by the pipelines such as build, test, deploy, etc.  
Note: For the application level env vars see [this](#application-env-vars).

| Environment Variables | Description |
| --------------------- | ----------- |
| DEPLOY_SERVICE_PORT   | Optional. port number to access this service. default to `2200` |
| DEPLOY_IMAGE_TAG   | optional. docker image tag. default to `development` |
| DEPLOY_IMAGE_PULL_SECRET   | optional. if you are using image pull secrets please refer to [k8s image pull secrets](http://kubernetes.io/docs/user-guide/images/#using-a-private-registry) |
| DOCKER_USERNAME   | optional. if you are using docker hub. eg: `axnux` |
| DOCKER_PASSWORD   | optional. if you are using docker hub. |
| DOCKER_REPO   | **Require**. eg: `template-svc` |

### Config & Config Merging
To use the configuration  
```js
var config = require('config/default')
console.log(config.appName) // template-svc
```

The loading sequence of the configuration file:  

1. Load `config/env/default.js` (will always be overridden by `2`, `3`)  
2. Load `config/env/{development|test|production}.js` (load only when it exists. default to development. will be overridden by `3`)  
3. Load `config/env/local/default.js` (load only when it exists. you can create this file from `config/env/local/default.js.sample` and it will not be checked-in to git)  

#### Notes:
1. It is recommended to place defaults/commons set of configurations in `config/env/default`.  
2. If you are using a set of private credentials for local development, please put it in `config/env/local/default.js`. And then pass the actual credentials using environment variables for staging, production, testing, etc.  (as suggested by the [12factor app](https://12factor.net/) )
3. If the above `2` is inappropriate for your setup, you can also put it in environment specific configurations/credentials directly into any of the `config/env/{development|test|production}.js` file.  



### Application Env Vars
There are few ways to set environment variables for Kubernetes pods:   

1. **Option One** Set env vars into Docker image itself.  
 For instance, if your application config requires a environment variables called *S3_REGION*  
 then you can set the *TEMPLATE_AWS_S3_REGION* in wercker dashboard.  
 And refer it at the *env* section in `wercker.yml` as below (same goes to other env vars):  
   ![Imgur](http://i.imgur.com/v1fUv4H.png)  
2. **Option Two** Set env vars in kubernetes configmap,  
 then load it into the deployment file `deploy/service-template.yml`. [Learn more](http://kubernetes.io/docs/user-guide/configmap/#use-case-consume-configmap-in-environment-variables)



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


## Contribution
Some of the wercker steps were created and used to meet the very specific needs for my projects. Thus feel free to submit **PULL REQUEST** for better solution/bug fixes :)

## Credits
Inspired by [MEANJS](https://github.com/meanjs/mean/)

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
