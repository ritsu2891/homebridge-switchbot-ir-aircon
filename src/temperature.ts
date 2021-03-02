import SHT31 from 'raspi-node-sht31';

const sht31 = new SHT31(0x45);

export async function getTemp() {
  const data = await sht31.readSensorData();
  const temp = Math.round(data.temperature);
  const humidity = Math.round(data.humidity);
  return temp;
}