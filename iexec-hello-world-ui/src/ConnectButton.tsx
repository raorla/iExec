import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
// import the bellecour configuration
import { bellecour } from "./wagmiConfig";

function ConnectButton() {
  const { isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // check connection and chain
  const isConnectedToBellecour = isConnected && chainId === bellecour.id;

  const onClick = isConnectedToBellecour
    ? () => disconnect()
    : () => connect({ connector: injected(), chainId: bellecour.id });

  const text = isConnectedToBellecour ? "Disconnect" : "Connect";

  return <button onClick={onClick}>{text}</button>;
}

export default ConnectButton;
