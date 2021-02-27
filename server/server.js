import {
    createRequire
} from "module";
const require = createRequire(
    import.meta.url);
const ewelink = require("ewelink-api");
const express = require("express");
const app = express();

const port = 3000;

import credentials from "../config/credentials.js";
import settings from "../config/settings.js";

console.log(credentials);
console.log(settings);

/* instantiate class */
const connection = new ewelink({
    email: credentials.ewelink_email,
    password: credentials.ewelink_password,
    region: credentials.ewelink_region,
});

(async function testCredentials() {
    const devices = await connection.getDevices();
    if ('error' in devices)
        console.log(devices.msg + ". The application will continue and respond with the error message, to make sure you are informed.");
})();

app.use(express.json()); // treat all request bodies as application/json

app.post("/", async (req, res) => {
    const requestedDeviceNameKeys = req.body.devicenameincludes != undefined ? Array.from(req.body.devicenameincludes) : undefined;
    const requestedDeviceId = req.body.deviceid != undefined && req.body.deviceid != "" ? String(req.body.deviceid) : undefined;
    const requestedActionOnDevice = req.body.params.switch != undefined && req.body.params.switch != "" ? String(req.body.params.switch) : undefined;

    const devices = await connection.getDevices();

    if ('error' in devices) {
        res.status(devices.error).send(devices.msg);
        return;
    }

    let selectedDevice;

    if (requestedDeviceId != undefined) // deviceid present?
        selectedDevice = getDeviceById(devices, requestedDeviceId);
    else {
        if (requestedDeviceNameKeys != undefined && requestedDeviceNameKeys.length > 0) // name keys present?
            selectedDevice = getDeviceByName(devices, requestedDeviceNameKeys);
        else {
            res.status(400).send(`You need to specify at least one of [deviceid, devicenameincludes]`);
            return;
        }
    }

    if (selectedDevice != undefined) {
        const actionResponse = requestedActionOnDevice == "toggle" ?
            await connection.toggleDevice(selectedDevice.deviceid) :
            await connection.setDevicePowerState(selectedDevice.deviceid, requestedActionOnDevice);
        const deviceStateAfterAction = await connection.getDevicePowerState(selectedDevice.deviceid)

        switch (requestedActionOnDevice) {
            case "on":
            case "off":
                res.status(actionResponse.status == "ok" ? 200 : 404).send(`Device ''${selectedDevice.deviceid}'' named ''${selectedDevice.name}'' ${actionResponse.status == "ok" ? 'successfully switched ' + (deviceStateAfterAction.state) : 'failed to switch ' + (deviceStateAfterAction.state == "on" ? "off" : "on")}`);
                break;
            case "toggle":
                res.status(actionResponse.status == "ok" ? 200 : 404).send(`Device ''${selectedDevice.deviceid}'' named ''${selectedDevice.name}'' ${actionResponse.status == "ok" ? 'successfully toggled ' + (deviceStateAfterAction.state) : 'failed to toggle ' + (deviceStateAfterAction.state == "on" ? "off" : "on")}`);
                break;
            default:
                res.status(400).send(`Invalid action ${requestedActionOnDevice}, valid choices are [on, off, toggle]`, );
                break;
        }
    } else
        res.status(404).send(`No device found matching id: "${requestedDeviceId}" or name-keys: "${requestedDeviceNameKeys}"`);
});

app.get("/", async (req, res) => {
    const devices = await connection.getDevices();

    if ('error' in devices) {
        res.status(devices.error).send(devices.msg);
        return;
    }

    res.status(200).json(devices);
});

app.listen(port, () => {
    console.log(`Ewelink api server listening on http://localhost:${settings.port}`);
});



// Gets the device with highest count of matches of provided key-array.
// If multiple devices have the same match-count, the last matched is returned.
// This could be modified to return groups od devices if needed later on.
function getDeviceByName(devices, nameKeys) {
    let bestMatchingDevice = undefined;
    let highestMatchingKeyCount = 0;
    for (let deviceIndex in devices) {
        let matchingKeyCount = 0;
        for (let nameKeyIndex in nameKeys) {
            matchingKeyCount += String(devices[deviceIndex].name).toLowerCase().includes(String(nameKeys[nameKeyIndex]).toLowerCase()) ? 1 : 0;
        }
        if (matchingKeyCount > highestMatchingKeyCount) {
            highestMatchingKeyCount = matchingKeyCount;
            bestMatchingDevice = devices[deviceIndex];
        }
    }
    return bestMatchingDevice;
}


function getDeviceById(devices, id) {
    let deviceToReturn = undefined;
    devices.forEach(device => {
        if (String(device.deviceid) == id) {
            deviceToReturn = device;
        }
    });
    return deviceToReturn;
}