import { Service, Logger, API, AccessoryConfig } from 'homebridge';
import { setup, pushIR, MODE, POW } from './switchbot';
import { Characteristic } from "hap-nodejs";

const UNITS = {
  C: Characteristic.TemperatureDisplayUnits.CELSIUS,
  F: Characteristic.TemperatureDisplayUnits.FAHRENHEIT,
}

export class ExamplePlatformAccessory {
  informationService: Service;
  airconService: Service;

  pow = POW.OFF;
  currentState = MODE.HEAT;
  targetState = MODE.HEAT;
  targetTemperature = 20;
  units = UNITS.C;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    setup(config.token as string);

    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'SwitchBot')
      .setCharacteristic(this.api.hap.Characteristic.Model, 'IRAIRCON');
    this.airconService = new this.api.hap.Service.Thermostat();
    this.airconService.getCharacteristic(this.api.hap.Characteristic.CurrentHeatingCoolingState)
      .on('get', (callback) => { callback(null, 1) })
      .on('set', (value, callback) => { callback(null) });
    this.airconService.getCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState)
      .on('get', (callback) => { callback(null, 1) })
      .on('set', (value, callback) => { callback(null) });
    this.airconService.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
      .on('get', (callback) => { callback(null, 10) });
    this.airconService.getCharacteristic(this.api.hap.Characteristic.TargetTemperature)
      .on('get', (callback) => { callback(null, 1) })
      .on('set', (value, callback) => { callback(null) });
    this.airconService.getCharacteristic(this.api.hap.Characteristic.TemperatureDisplayUnits)
      .on('get', (callback) => { callback(null, 0) })
      .on('set', (value, callback) => { callback(null) });
  }

  getServices() {
    return [
      this.informationService,
      this.airconService
    ];
  }
}