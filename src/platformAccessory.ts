import { Service, Logger, API, AccessoryConfig } from 'homebridge';

export class ExamplePlatformAccessory {
  informationService: Service;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'SwitchBot')
      .setCharacteristic(this.api.hap.Characteristic.Model, 'IRAIRCON');
  }

  getServices() {
    return [
      this.informationService,
    ];
  }
}
