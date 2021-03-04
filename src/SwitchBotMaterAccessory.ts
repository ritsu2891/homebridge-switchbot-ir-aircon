import { Service, Logger, API, AccessoryConfig, Units } from 'homebridge';
import { setup, getMaterStatus } from './switchbot';
import { Characteristic } from "hap-nodejs";

const UNITS = {
  C: Characteristic.TemperatureDisplayUnits.CELSIUS,
  F: Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
}

export class SwitchBotMaterAccessory {
  informationService: Service;
  temperatureService: Service;
  humidityService: Service;

  currentState: any = {
    sucess: false
  }

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    setup(config.token as string);

    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Manufacturer, 'SwitchBot')
      .setCharacteristic(Characteristic.Model, 'SwitchBot Mater');

    this.temperatureService = new this.api.hap.Service.TemperatureSensor();
    this.temperatureService.getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({
        unit: Units['CELSIUS'],
        validValueRanges: [-273.15, 100],
        minValue: -273.15,
        maxValue: 100,
        minStep: 0.1,
      })
      .on('get', this.handleCurrentTemperatureGet.bind(this));

    this.humidityService = new this.api.hap.Service.HumiditySensor();
    this.humidityService.getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .setProps({
        minStep: 0.1,
      })
      .on('get', this.handleCurrentHumidityGet.bind(this));
  }

  async handleCurrentTemperatureGet(callback) {
    callback(null, this.currentState.temperature ?? 15);
    this.sync();
  }
  async handleCurrentHumidityGet(callback) {
    callback(null, this.currentState.humidity ?? 0);
    this.sync();
  }

  getServices() {
    return [
      this.informationService,
      this.temperatureService,
      this.humidityService
    ];
  }

  async sync() {
    await this.syncMaterStatus();
    await this.updateHomeKitCharacteristic()
  }

  async syncMaterStatus() {
    this.currentState = await getMaterStatus();
  }

  async updateHomeKitCharacteristic() {
    if (!this.temperatureService || !this.humidityService) {
      return;
    }
    if (!this.currentState.success) {
      return;
    }
    this.temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .updateValue(this.currentState.temperature);
    this.humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .updateValue(this.currentState.humidity);
  }
}
