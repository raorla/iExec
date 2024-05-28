import { IExec, utils } from "iexec";
// load .env
import "dotenv/config";

const { PRIVATE_KEY } = process.env;

export const iexec = new IExec({
  ethProvider: utils.getSignerFromPrivateKey(
    "bellecour",
    PRIVATE_KEY as string
  ),
});
