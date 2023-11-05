# Ewelink REST API Server
![Docker CI/CD](https://github.com/DoganM95/Ewelink-rest-api-server/actions/workflows/docker-image.yml/badge.svg)

A Node.js server application that processes HTTP requests and forwards commands to eWeLink servers for device operations like turn on/off or toggling. This server utilizes the [eWeLink API](https://ewelink-api.now.sh/docs/quickstart).

## Setup
### Docker Container

#### 1. Using Pre-built Image from Docker Hub (Recommended)
- Access the detailed documentation [on Docker Hub](https://hub.docker.com/repository/docker/doganm95/ewelink-rest-api-server).

#### 2. Building Locally 
- Clone the repository:
  ```bash
  git clone https://github.com/DoganM95/Ewelink-rest-api-server
  ```

- Navigate to the cloned directory:
  ```bash
  cd Ewelink-rest-api-server
  ```

- Build the Docker image:
  ```bash
  docker build -t doganm95/ewelink-rest-api-server -f ./docker/Dockerfile .
  ```

- Run the Docker container:
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

## Usage

### Authorization
If SSL encryption is enabled (using `privkey.pem` and `cert.pem` files), each request must include an `Authorization` header with a Bearer Token. This token is your eWeLink password hashed using your chosen algorithm (default: `sha3-512`). In `dev` mode, the container logs the hashed password for copying.

### API Endpoints

#### 1. Fetching Devices List
- **Method**: `GET`
- **Description**: Retrieve a list of all registered devices along with their details.
  
#### 2. Control a Device 
- **Method**: `POST`
- **Description**: Control a device using its name or ID.
- **Body**:
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
  - `devicenameincludes`: An array of keywords contained in the device name. The most relevant device is controlled based on these keywords. 
  - `deviceid`: Direct device ID reference (prioritized over `devicenameincludes`).
  - `switch`: Device action - valid values are `on`, `off`, or `toggle`.
  - `outlet`: Optional for multi-relay devices (starts from 1).

## Migration & Resources
For updates to accommodate eWeLink's new OAuth mechanism:
- [eWeLink OAuth Login Demo](https://github.com/coolkit-carl/eWeLinkOAuthLoginDemo)
- [eWeLink API Next](https://github.com/coolkit-carl/ewelink-api-next/blob/main/docs/en/DeviceManagement.md)
- [eWeLink Developer Portal](https://dev.ewelink.cc/#/)
- [eWeLink API Issue #220](https://github.com/skydiver/ewelink-api/issues/220)
- [eWeLink API Official Docs](https://coolkit-technologies.github.io/eWeLink-API/#/en/OAuth2.0)
