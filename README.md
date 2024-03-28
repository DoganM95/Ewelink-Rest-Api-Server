# Ewelink REST API Server

A Node.js server application that processes HTTP requests and forwards commands to eWeLink servers for device operations like turn on/off or toggling. This server utilizes the [eWeLink API](https://ewelink-api.now.sh/docs/quickstart).

## Docker

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

### Arguments  

- `-e EWELINK_USERNAME` - Your Ewelink Username, usually an email address
- `-e EWELINK_PASSWORD` - Your Ewelink password
- `-e EWELINK_REGION` - Your region, e.g. `eu`, `us`
- `-e PASSWORD_HASHING_ALGORITHM` - supported:  
    `RSA-MD4, RSA-MD5, RSA-MDC2, RSA-RIPEMD160, RSA-SHA1, RSA-SHA1-2, RSA-SHA224, RSA-SHA256, RSA-SHA3-224, RSA-SHA3-256, RSA-SHA3-384, RSA-SHA3-512, RSA-SHA384, RSA-SHA512, RSA-SHA512/224, RSA-SHA512/256, RSA-SM3, blake2b512, blake2s256, id-rsassa-pkcs1-v1_5-with-sha3-224, id-rsassa-pkcs1-v1_5-with-sha3-256, id-rsassa-pkcs1-v1_5-with-sha3-384, id-rsassa-pkcs1-v1_5-with-sha3-512, md4, md4WithRSAEncryption, md5, md5-sha1, md5WithRSAEncryption, mdc2, mdc2WithRSA, ripemd, ripemd160, ripemd160WithRSA, rmd160, sha1, sha1WithRSAEncryption, sha224, sha224WithRSAEncryption, sha256, sha256WithRSAEncryption, sha3-224, sha3-256, sha3-384, sha3-512, sha384, sha384WithRSAEncryption, sha512, sha512-224, sha512-224WithRSAEncryption, sha512-256, sha512-256WithRSAEncryption, sha512WithRSAEncryption, shake128, shake256, sm3, sm3WithRSAEncryption, ssl3-md5, ssl3-sha1, whirlpool`.  <br/>
Default, if omitted: `sha3-512`
- `-e SERVER_MODE` can be `prod` or `dev`. For initial container setup & testing, try dev. If everything works, you can switch to `-e "SERVER_MODE=prod"`, to turn off console logs
- `-p <port_to_use>:3000`
- `-v <local_cert_folder>:/usr/src/app/volume/ssl/` - can contain the cert.pem and privkey.pem as files. If omitted, a non-ssl-encrypted http server will start

## Example

```shell
docker run \  
  -p 8080:3000 \  
  -e "EWELINK_USERNAME=someone@gmail.com" \  
  -e "EWELINK_PASSWORD=passW"  \  
  -e "EWELINK_REGION=eu" \  
  -e "PASSWORD_HASHING_ALGORITHM=sha512" \  
  -e "SERVER_MODE=prod" \  
  -v "C:\Users\Dogan\OneDrive\Desktop\certs_tmp\:/usr/src/app/volume/ssl/" \  
  doganm95/ewelink-rest-api-server  
```

## Usage

### Authorization
If SSL encryption is enabled (using `privkey.pem` and `cert.pem` files), each request must include an `Authorization` header with a Bearer Token. This token is your eWeLink password hashed using your chosen algorithm (default: `sha3-512`). In `dev` mode, the container logs the hashed password for copying.

### API Endpoints

#### Fetch Devices List
- **Method**: `GET`
- **Description**: Retrieve a list of all registered devices along with their details.
  
#### Control a Device 
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
