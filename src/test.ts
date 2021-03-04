import { setup, getMaterStatus } from './switchbot';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  await setup(process.env.SBTOKEN ?? "");
  console.log(await getMaterStatus());
}

main();