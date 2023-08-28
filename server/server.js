import fs from 'fs';
import eWeLink from 'ewelink-api-next';
import express from 'express';
import escape from 'escape-html';
import http from 'http';
import https from 'https';
import crypto from 'crypto';

try {
    fs.mkdirSync("./volume/ssl/");
} catch (e) {}

let ssl;
let useSsl;
try {
    ssl = {
        key: fs.readFileSync("./volume/ssl/privkey.pem", "utf8"),
        cert: fs.readFileSync("./volume/ssl/cert.pem", "utf8"),
    };
    useSsl = true;
} catch (e) {
    console.log(String(e).split("\n")[0]);
    console.log("Starting server without encryption.");
    useSsl = false;
}

const ewelinkClient = new eWeLink.WebAPI({
    appId: process.env.EWELINK_APP_ID || "",
    appSecret: process.env.EWELINK_APP_SECRET || "",
    region: process.env.EWELINK_REGION || "eu",
});

const serverPort = 3000;
const hashingAlgorithm = "sha3-512";
const hashedPassword = hashPassword();

// disable console logging, if docker run -e "SERVER_MODE=prod"
if (process.env.SERVER_MODE == "prod") {
    console.log = () => {};
}

// (async function containerKeepAliveForAnalysis() {
//     console.log("Keeping container alive for filesystem analysis..");
//     while (true) {}
// })();

(async function initialize() {
    // test credentials
    const response = await ewelinkClient.user.login({
        account: process.env.EWELINK_USERNAME || "",
        password: process.env.EWELINK_PASSWORD || "",
        areaCode: process.env.EWELINK_AREA_CODE || "+49",
    });
    console.info(JSON.stringify(response));

    let devices = await ewelinkClient.device.getAllThingsAllPages();
    if ("error" in devices) {
        console.log(devices.msg + ". The application will continue and respond with the error message, to make sure you are informed.");
    }

    console.log(hashingAlgorithm + " hashed password: " + hashedPassword); // log hashed password on app start
})();

const app = express();  // Make sure 'app' is defined here

app.use(express.json()); // treat all request bodies as application/json

app.all("/", async (req, res, next) => {
    try {
        authenticate(req);
    } catch (e) {
        return res.status(401).json(e);
    }
    next();
});

app.post("/", async (req, res) => {
    const requestedDeviceNameKeys = req.body.devicenameincludes != undefined ? Array.from(req.body.devicenameincludes) : undefined;
    const requestedDeviceId = req.body.deviceid != undefined && req.body.deviceid != "" ? String(req.body.deviceid) : undefined;
    const requestedActionOnDevice = req.body.params.switch != undefined && req.body.params.switch != "" ? String(req.body.params.switch) : undefined;
    const requestedOutlet = req.body.params.outlet != undefined && req.body.params.outlet != "" ? String(req.body.params.outlet) : undefined;

    const devices = await ewelinkConnection.getDevices();

    if ("error" in devices) return res.status(devices.error).send(devices.msg);

    let selectedDevice;
    if (requestedDeviceId != undefined) {
        // deviceid present?
        selectedDevice = getDeviceById(devices, requestedDeviceId);
    } else {
        if (requestedDeviceNameKeys != undefined && requestedDeviceNameKeys.length > 0) {
            // name keys present?
            selectedDevice = getDeviceByName(devices, requestedDeviceNameKeys);
        } else {
            return res.status(400).send(`You need to specify at least one of [deviceid, devicenameincludes]`);
        }
    }

    if (selectedDevice != undefined) {
        const actionResponse =
            requestedActionOnDevice == "toggle"
                ? await ewelinkConnection.toggleDevice(selectedDevice.deviceid, requestedOutlet)
                : await ewelinkConnection.setDevicePowerState(selectedDevice.deviceid, requestedActionOnDevice, requestedOutlet);
        const deviceStateAfterAction = await ewelinkConnection.getDevicePowerState(selectedDevice.deviceid, requestedOutlet);

        switch (requestedActionOnDevice) {
            case "on":
            case "off":
                res.status(actionResponse.status == "ok" ? 200 : 404).send(
                    `Device ''${selectedDevice.deviceid}'' named ''${selectedDevice.name}'' ${
                        actionResponse.status == "ok" ? "successfully switched " + deviceStateAfterAction.state : "failed to switch " + (deviceStateAfterAction.state == "on" ? "off" : "on")
                    } ${requestedOutlet != undefined ? "outlet " + requestedOutlet : ""}`,
                );
                break;
            case "toggle":
                res.status(actionResponse.status == "ok" ? 200 : 404).send(
                    `Device ''${selectedDevice.deviceid}'' named ''${selectedDevice.name}'' ${
                        actionResponse.status == "ok" ? "successfully toggled " + deviceStateAfterAction.state : "failed to toggle " + (deviceStateAfterAction.state == "on" ? "off" : "on")
                    }  ${requestedOutlet != undefined ? "outlet " + requestedOutlet : ""}`,
                );
                break;
            default:
                res.status(400).send(`Invalid action ${escape(requestedActionOnDevice)}, valid choices are [on, off, toggle]`);
                break;
        }
    } else res.status(404).send(`No device found matching id: "${escape(requestedDeviceId)}" or name-keys: "${escape(requestedDeviceNameKeys)}"`);
});

app.get("/", async (req, res) => {
    const devices = await ewelinkConnection.getDevices();
    if ("error" in devices) return res.status(devices.error).send(devices.msg);
    return res.status(200).json(devices);
});

if (useSsl) {
    https.createServer(ssl, app).listen(serverPort, () => {
        console.log(`Ewelink api server listening on https://localhost:${serverPort} (Container)`);
    });
} else {
    http.createServer(app).listen(serverPort, () => {
        console.log(`Ewelink api server listening on http://localhost:${serverPort} (Container)`);
    });
}

/**
 * @param {Object[]} devices Contains all known devices
 * @param {String[]} nameKeys Contains keywords to match the name fully/partly
 * @returns {Object} device, that matches the sum of keywords best
 */
function getDeviceByName(devices, nameKeys) {
    let bestMatchingDevice = undefined;
    let highestMatchingKeyCount = 0;
    for (let deviceIndex in devices) {
        let matchingKeyCount = 0;
        for (let nameKeyIndex in nameKeys) matchingKeyCount += String(devices[deviceIndex].name).toLowerCase().includes(String(nameKeys[nameKeyIndex]).toLowerCase()) ? 1 : 0;
        if (matchingKeyCount > highestMatchingKeyCount) {
            highestMatchingKeyCount = matchingKeyCount;
            bestMatchingDevice = devices[deviceIndex];
        }
    }
    return bestMatchingDevice;
}

/**
 * @param {Object[]} devices Contains all known devices
 * @param {String[]} id ID of device to control, look up in ewelink app
 * @returns {Object} device, matching the given id
 */
function getDeviceById(devices, id) {
    let deviceToReturn = undefined;
    devices.forEach((device) => {
        if (String(device.deviceid) == id) deviceToReturn = device;
    });
    return deviceToReturn;
}

function authenticate(req) {
    if (useSsl) {
        if (req.headers.authorization == undefined) {
            throw "Authentication failed - bearer token missing";
        }

        const receivedToken = req.headers.authorization.replace("Bearer ", "");
        if (receivedToken != hashedPassword) throw "Authentication failed - wrong bearer token.";
    }
}

function hashPassword() {
    return crypto
        .createHash(hashingAlgorithm)
        .update(process.env.EWELINK_PASSWORD || "")
        .digest("hex");
}
