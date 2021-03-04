import { API } from 'homebridge';

import { ExamplePlatformAccessory } from './platformAccessory';
import { SwitchBotMaterAccessory } from './SwitchBotMaterAccessory';

export = (api: API) => {
  api.registerAccessory('Aircon', ExamplePlatformAccessory);
  api.registerAccessory('SBMater', SwitchBotMaterAccessory);
};