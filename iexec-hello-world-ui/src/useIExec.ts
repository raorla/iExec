import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Eip1193Provider, IExec } from "iexec";
import { bellecour } from "./wagmiConfig";

// read only IExec instance provided when the user account is not connected
const readOnlyIexec = new IExec({ ethProvider: bellecour.id });

function useIExec() {
  // use the connection provided by the wagmi hook
  const { isConnected, chainId, address, connector } = useAccount();
  const isConnectedToBellecour = isConnected && chainId === bellecour.id;

  // maintains the IExec instance in the state
  const [iexec, setIexec] = useState<IExec | undefined>(undefined);

  useEffect(
    () => {
      // if everything is ready
      if (isConnectedToBellecour && address && connector?.getProvider) {
        connector
          .getProvider()
          .then((provider) => {
            // init and store the IExec instance
            setIexec(new IExec({ ethProvider: provider as Eip1193Provider }));
          })
          .catch((e) => console.error(e));
      } else {
        // remove the IExec instance
        setIexec(undefined);
      }
    },
    // trigger when one of the following change
    [isConnectedToBellecour, address, connector]
  );

  // returns the IExec instance
  return { iexec: iexec || readOnlyIexec, isConnected: !!iexec };
}

export default useIExec;
