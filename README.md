# Microservices Starter template [![wercker status](https://app.wercker.com/status/3990bf39fc888c44f5cd6821df712c87/s "wercker status")](https://app.wercker.com/project/bykey/3990bf39fc888c44f5cd6821df712c87)

An *experimental* nodejs BDD scaffolding for microservices

Support for **Docker** through **Wercker**

## Start development with local nodejs (recommended)
### Prerequisites  
- nodejs  

### Instructions  
1. First install the dependencies using `npm install`  
2. To start with development, you have two options:  
   - **LOCAL** - execute `npm start` and keep it running in terminal  
       *Note: this start your web app at port 3000 by default.*  
       *every time you update your js files. need to re-run this.*  
   - **BDD** - execute `npm run bdd` and keep it running in terminal  
       *Note: this will not start your web app but continuous testing.*  
       *every time you update your js files. it will auto restart test cases.*  

## Alternatives (using Wercker)
### Prerequisites  
- virtualbox 5.0.20  
- boot2docker-vagrant  
- wercker cli  

### Instructions  
For some reason you might don't want to use nodejs in your local machine.   
Then you can still start development using **wercker cli**  
1. To start with development using **wercker**  
    execute `wercker dev --expose-ports=true`   
     (same as using the recommended *LOCAL* mode above)    
     *Note: it will detect file changes and auto restart web app.*  
2. If you would like to do **BDD** please refer to `wercker.yml`  
```
dev:
  steps:
    #
    # ...
    #
    # make sure this part is commented out
    # - internal/watch:
    #     code: npm start
    #     reload: true

    # make sure the code below is not commented
    - script:
        name: start bdd environment
        code: npm run bdd

```  
3. To push the development container to docker.  
    Modify the`wercker.yml` as below  
```
build:
  steps:

    # make sure the code below is not commented  
     - internal/docker-push:
         disable-sync: true
         username: $DOCKER_USERNAME  # replace DOCKER_USERNAME with your docker hub user name
         password: $DOCKER_PASSWORD  # replace DOCKER_PASSWORD with your docker hub password
         repository: $DOCKER_REPO # replace DOCKER_REPO with your docker hub registries name. eg: axnux/media-svc
         working-dir: /pipeline/source
         cwd: /pipeline/source
         cmd: start
         entrypoint: /usr/local/bin/npm
         tag: debug-build

```
Make sure the **$DOCKER_USERNAME**, **$DOCKER_PASSWORD** and **$DOCKER_REPO** are replaced with actual value.  
Then execute `wercker build` in terminal.  

## Folder structures
1. Implement all services in **src**  
2. Implement all routing in **src/SERVICE_NAME/routes**  
3. Implement all test cases in **test**

## todo
1. ~~add deploy pipeline into wercker~~
2. add support for gRPC
3. ~~automate build~~


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
