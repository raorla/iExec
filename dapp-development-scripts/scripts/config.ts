import { IExec, IExecConfigOptions, utils } from "iexec";
// load .env
import "dotenv/config";

const { PRIVATE_KEY, TEE_DEBUG } = process.env;

const options: IExecConfigOptions = {};
let defaultWorkerpool = "prod-v8-bellecour.main.pools.iexec.eth";

if (TEE_DEBUG) {
  console.warn("Using TEE DEBUG mode");
  options.smsURL = "https://sms.scone-debug.v8-bellecour.iex.ec";
  defaultWorkerpool = "debug-v8-bellecour.main.pools.iexec.eth";
}

export const iexec = new IExec(
  {
    ethProvider: utils.getSignerFromPrivateKey(
      "bellecour",
      PRIVATE_KEY as string
    ),
  },
  options
);

export const workerpool = defaultWorkerpool;
