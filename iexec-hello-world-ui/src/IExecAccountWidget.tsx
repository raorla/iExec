import { useEffect, useState } from "react";
import useIExec from "./useIExec";
import { BN, formatRLC } from "iexec/utils";

function IExecAccountWidget() {
  const { isConnected, iexec } = useIExec();

  const [address, setAddress] = useState<string | undefined>();
  const [ens, setEns] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<BN | undefined>();
  const [accountBalance, setAccountBalance] = useState<BN | undefined>();

  useEffect(() => {
    if (isConnected) {
      // get the connected wallet address
      iexec.wallet
        .getAddress()
        .then((userAddress) => {
          setAddress(userAddress);
          // get the ENS associated
          iexec.ens
            .lookupAddress(userAddress)
            .then((userEns) => {
              setEns(userEns);
            })
            .catch((e) => console.error(e));
          // get the wallet balance
          iexec.wallet
            .checkBalances(userAddress)
            .then(({ nRLC }) => {
              setWalletBalance(nRLC);
            })
            .catch((e) => console.error(e));
          // get the account balance
          iexec.account
            .checkBalance(userAddress)
            .then(({ stake }) => {
              setAccountBalance(stake);
            })
            .catch((e) => console.error(e));
        })
        .catch((e) => console.error(e));
    } else {
      setAddress(undefined);
      setEns(null);
      setWalletBalance(undefined);
      setAccountBalance(undefined);
    }
  }, [isConnected, iexec]);

  return (
    <div>
      <h2>Account details</h2>
      <p>
        Address: {address}
        {ens && ` (${ens})`}
      </p>
      <p>Wallet: {walletBalance && `${formatRLC(walletBalance)} xRLC`}</p>
      <p>
        Account: {accountBalance && `${formatRLC(accountBalance)} xRLC staked`}
      </p>
    </div>
  );
}

export default IExecAccountWidget;
