import { utils } from "iexec";
import { iexec } from "./config.js";

const userAddress = await iexec.wallet.getAddress();

const walletBalance = await iexec.wallet.checkBalances(userAddress);

console.log(`wallet: ${utils.formatRLC(walletBalance.nRLC)} RLC`);

const accountBalance = await iexec.account.checkBalance(userAddress);

console.log(
  `account: ${utils.formatRLC(
    accountBalance.stake
  )} RLC (staked) + ${utils.formatRLC(accountBalance.locked)} RLC (locked)`
);
