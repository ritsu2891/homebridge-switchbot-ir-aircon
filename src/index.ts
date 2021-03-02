import { API } from 'homebridge';

import { ExamplePlatformAccessory } from './platformAccessory';

export = (api: API) => {
  api.registerAccessory('Aircon', ExamplePlatformAccessory);
};
