import axios from 'axios';

let api = axios.create({
  responseType: 'json',
});
let deviceId = "";
let meterDeviceId = "";

export const MODE = {
  AUTO: 1, // 自動
  COOL: 2, // 冷房
  DEHUMD: 3, // 除湿
  BLOW: 4, // 送風
  HEAT: 5 // 暖房
}

export const FANSPEED = {
  AUTO: 1,
  WEAK: 2,
  NORMAL: 3,
  STRONG: 4
}

export const POW = {
  ON: true,
  OFF: false
}

const DeviceURL = 'https://api.switch-bot.com/v1.0/devices';

export async function setup(token: string) {
  api.interceptors.request.use((request) => {
    request.headers.Authorization = token;
    request.headers['Content-Type'] = 'application/json; charset=utf8';
    return request;
  });
  await discoverDevice();
}

async function discoverDevice() {
  try {
    const devices = (await api.get(DeviceURL)).data;
    for (let device of devices.body.deviceList) {
      if (meterDeviceId === "" && device.deviceType === 'Meter') {
        meterDeviceId = device.deviceId;
      }
    }
    for (let device of devices.body.infraredRemoteList) {
      if (deviceId === "" && device.remoteType == 'Air Conditioner') {
        deviceId = device.deviceId;
      }
    }
    return;
  } catch (e) {
    return;
  }
}

export async function pushIR(temperature: number, mode: number, active: boolean) {
  if (deviceId !== "") {
    const payload = {
      commandType: 'command',
      parameter: `${temperature},${mode},${FANSPEED.AUTO},${active ? 'on' : 'off'}`,
      command: 'setAll',
    }
    await api.post(`${DeviceURL}/${deviceId}/commands`, payload);
  }
}

export async function getMaterStatus() {
  let falseStatus = {
    sucess: false
  };
  try {
    if (meterDeviceId !== "") {
      const deviceStatus = (
        await api.get(`${DeviceURL}/${meterDeviceId}/status`)
      ).data;
      if (deviceStatus.message === 'success') {
        let status = {
          sucess: true,
          humidity: deviceStatus.body?.humidity ?? undefined,
          temperature: deviceStatus.body?.temperature ?? undefined,
          batteryLevel: deviceStatus.body ? 100 : 10,
          batteryLow: deviceStatus.body ? false : true
        }
        return status;
      } else {
        return falseStatus;
      }
    } else {
      return falseStatus;
    }
  } catch (e) {
    return falseStatus;
  }
}