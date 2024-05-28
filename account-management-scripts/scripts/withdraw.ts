import { utils } from "iexec";
import { iexec } from "./config.js";

const { NRLC_AMOUNT } = process.env;

const { txHash, amount } = await iexec.account.withdraw(NRLC_AMOUNT as string);

console.log(`withdrawn: ${utils.formatRLC(amount)} RLC (tx: ${txHash})`);
