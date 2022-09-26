### Runs a node.js server which accepts http requests and sends corresponding commands to ewelink servers to turn on/off or toggle devices using [this eWelink API](https://ewelink-api.now.sh/docs/quickstart)

[![Docker CI/CD](https://github.com/DoganM95/Ewelink-rest-api-server/actions/workflows/docker-image.yml/badge.svg)](https://github.com/DoganM95/Ewelink-rest-api-server/actions/workflows/docker-image.yml)

# Setup (Docker Container)

- ## Using pre-built image from docker hub (recommended)

    [See documentation on docker hub](https://hub.docker.com/repository/docker/doganm95/ewelink-rest-api-server)

- ## Building it locally (clone repository first)

  1. `git clone https://github.com/DoganM95/Ewelink-rest-api-server`  
  2. Open a terminal session in the cloned folder
  3. Build the docker image using the cloned files:  
   `docker build -t doganm95/ewelink-rest-api-server -f ./docker/Dockerfile .`  
  4. Run the image as a container:  

    ```bash
    docker run \
        -p <port>:3000 \
        -e "EWELINK_USERNAME=<your_username>" \
        -e "EWELINK_PASSWORD=<your_password>"  \
        -e "EWELINK_REGION=<your_region>" \
        -e "HASHING_ALGORITHM=<your_preferred_algorithm>" \
        -e "SERVER_MODE=dev" \
        -v "<your_local_pem_certs_folder>:/usr/src/app/volume/ssl/" \
        doganm95/ewelink-rest-api-server
    ```

# Usage

## Authorization

If ssl encryption is used (by providing a `privkey.pem` and a `cert.pem`, see docker hub), every request needs an `Authorization` header, containing a Bearer Token. The Bearer Token is your Ewelink password, hashed using the algorithm you chose before (default: sha3-512). Running the container in dev mode logs the hashed pw, which can be copied.

## Requests

- ### Get a list of all your registered devices and their information (Name, ID, ...)

    `GET`-request with any/no body to the server.

- ### Control a device using keywords or its ID

    `POST`-request to the server with the following body for example:  

    ```json
    {  
        "devicenameincludes": ["desk", "light"],  
        "deviceid": "100012f3f4",
        "params": {
            "switch": "on",
            "outlet": 2
        }
    }
    ```

    - `devicenameincludes` is an array of keywords which the name of the device to be controlled can contain. The device which has the highest match to the given keywords will be controlled. If multiple devices have the same match-score, the last device (of devices object, see GET-Request) is controlled.  

    - `deviceid` is the device's id itself, can be looked up e.g. in the eWelink Smartphone app or using a get request to this server.  Deviceid will always be prioritized over devicenameincludes.  

    - `switch` is the action to perform on the chosen device. Possible actions are `on`, `off` and `toggle`, which switches the device to the state it is currently not in.  

    - `outlet` is optional field for multi-relay devices. Relay count starts from 1.
