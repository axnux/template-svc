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


## Learn more about setting up Wercker in CI/CD pipelines
- [see here](ci-cd.md)
