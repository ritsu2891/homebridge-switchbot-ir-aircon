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

  currentState = 0;
  targetState = 0;
  targetTemperature = 20;
  units = UNITS.C;

  mode = MODE.HEAT;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    setup(config.token as string);

    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Manufacturer, 'SwitchBot')
      .setCharacteristic(Characteristic.Model, 'IRAIRCON');

    this.airconService = new this.api.hap.Service.Thermostat();
    this.airconService.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this))
      .on('set', this.handleCurrentHeatingCoolingStateSet.bind(this));
    this.airconService.getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .setProps({
        validValues: [
          Characteristic.TargetHeatingCoolingState.OFF,
          Characteristic.TargetHeatingCoolingState.HEAT,
          Characteristic.TargetHeatingCoolingState.COOL
        ],
      })
      .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
      .on('set', this.handleTargetHeatingCoolingStateSet.bind(this));
    this.airconService.getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', (callback) => { callback(null, 15) });
    this.airconService.getCharacteristic(Characteristic.TargetTemperature)
      .setProps({
        minValue: 16,
        maxValue: 30,
        minStep: 1
      })
      .on('get', this.handleTargetTemperatureGet.bind(this))
      .on('set', this.handleTargetTemperatureSet.bind(this));
    this.airconService.getCharacteristic(Characteristic.TemperatureDisplayUnits)
      .setProps({
        validValues: [
          Characteristic.TemperatureDisplayUnits.CELSIUS
        ],
      })
      .on('get', (callback) => { callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS) })
      .on('set', (value, callback) => { callback(null) });
  }

  async handleCurrentHeatingCoolingStateGet(callback) {
    callback(null, this.currentState);
  }
  async handleCurrentHeatingCoolingStateSet(value, callback) {
    callback(null);
    this.currentState = value;
    this.syncStateIR();
  }

  async handleTargetHeatingCoolingStateGet(callback) {
    callback(null, this.targetState);
  }
  async handleTargetHeatingCoolingStateSet(value, callback) {
    callback(null);
    this.currentState = value;
    this.targetState = value;
    this.airconService
      .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .updateValue(this.currentState);
    this.syncStateIR();
  }

  async handleTargetTemperatureGet(callback) {
    callback(null, this.targetTemperature);
  }
  async handleTargetTemperatureSet(value, callback) {
    callback(null);
    this.targetTemperature = value;
    this.syncStateIR();
  }

  async syncStateIR() {
    let pow = POW.ON;
    switch (this.currentState) {
      case Characteristic.CurrentHeatingCoolingState.HEAT:
        pow = POW.ON;
        this.mode = MODE.HEAT;
        break;
      case Characteristic.CurrentHeatingCoolingState.COOL:
        pow = POW.ON;
        this.mode = MODE.COOL;
        break;
      case Characteristic.CurrentHeatingCoolingState.OFF:
        pow = POW.OFF;
        break;
      default:
        return;
    }
    await pushIR(this.targetTemperature, this.mode, pow);
  }

  getServices() {
    return [
      this.informationService,
      this.airconService
    ];
  }
}