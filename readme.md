# Microservices Starter template
An *experimental* nodejs BDD scaffolding for microservices

Support for **Docker** through **Wercker**

## Prerequisites
- virtualbox 5.0.20
- boot2docker-vagrant
- wercker cli
- nodejs (optional)


### Start development with local nodejs
1. first install the dependencies using `npm install`  
2. execute `npm run bdd`   and keep it running in terminal

### Alternatives
For some reason you might don't want to use nodejs in your local machine. Then you can do this  
1. first install the dependencies using `wercker build`  
2. execute `wercker dev`   and keep it running in terminal

# Folder structures
1. Implement all services in *src*  
2. Implement all routing in *src/SERVICE_NAME/routes*  
3. Implement all test cases in *test*  

# todo
1. add deploy pipeline into wercker  
2. add support for gRPC  
