### Runs a node.js server which accepts http requests and sends corresponding commands to ewelink servers to turn on/off or toggle devices using the [this eWelink API](https://ewelink-api.now.sh/docs/quickstart).

## Setup
- ### On a windows machine:
1. start a terminal session and cd into `/server` 
2. `npm run setupw` renames "..._template.js" files in config folder and installs necessary npm packages
3. edit **config/credentials.js** (and **config/settings.js** if needed)  
4. `npm run serve` starts the server (`localhost:3000` if not configured)
5. `npm run killw` kills any running node apps (in case of startup errors) 


## Requests

### Control a device using keywords or its ID:
`POST`-request to the server with the following body for example:

```
{  
    "devicenameincludes": ["desk", "light"],  
    "deviceid": "100012f3f4",
    "params": {
        "switch": "on"
    }
}
```

- `devicenameincludes` is an array of keywords which the name of the device to be controlled can contain. The device which has the highest match to the given keywords will be controlled. If multiple devices have the same match-score, the last device (of devices object, see GET-Request) is controlled. 

- `deviceid` is the device's id itself, can be looked up e.g. in the eWelink Smartphone app or using a get request to this server.  Deviceid will always be prioritized over devicenameincludes.

- `switch` is the action to perform on the chosen device. Possible actions are `on`, `off` and `toggle`, which switches the device to the state it is currently not in. 

### Get a list of all your registered devices and their information (Name, ID, ...):

  `GET`-request with any/no body to the server.

<br/>  

## Docker image:

https://hub.docker.com/repository/docker/doganm95/ewelink-rest-api-server
