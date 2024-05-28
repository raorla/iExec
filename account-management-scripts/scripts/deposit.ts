import { utils } from "iexec";
import { iexec } from "./config.js";

const { NRLC_AMOUNT } = process.env;

const { txHash, amount } = await iexec.account.deposit(NRLC_AMOUNT as string);

console.log(`deposited: ${utils.formatRLC(amount)} RLC (tx: ${txHash})`);
