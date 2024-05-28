# iexec hello-world ui

## Running the project

```sh
npm ci
npm run build
npm run preview
```

## Project scaffolding

This project use

- vite
- typescript
- react
- wagmi
- iexec

### Prerequisites

- nodejs
- npm

### installation

```sh
# scaffold a react + typescript project with vite (https://vitejs.dev/guide/)
npm create vite@latest -- iexec-hello-world-ui --template react-ts
cd iexec-hello-world-ui
npm install

# add the iexec sdk to interact with iexec (https://github.com/iExecBlockchainComputing/iexec-sdk/blob/master/docs/README.md)
npm install iexec

# add wagmi to connect the user wallet to our app (https://wagmi.sh/react/getting-started#manual-installation)
npm install wagmi viem@2.x @tanstack/react-query
```

### start project development with live reload

```sh
npm run dev
```

### configure wagmi for iexec bellecour blockchain

create `src/wagmiConfig.ts` with bellecour configuration

```ts
import { http, createConfig } from "wagmi";

// define bellecour chain
export const bellecour = {
  id: 0x86,
  name: "iExec Sidechain",
  network: "bellecour",
  nativeCurrency: {
    decimals: 18,
    name: "xRLC",
    symbol: "xRLC",
  },
  rpcUrls: {
    public: { http: ["https://bellecour.iex.ec"] },
    default: { http: ["https://bellecour.iex.ec"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Blockscout",
      url: "https://blockscout-bellecour.iex.ec",
    },
    default: { name: "Blockscout", url: "https://blockscout-bellecour.iex.ec" },
  },
  contracts: {
    ensRegistry: {
      address: "0x5f5B93fca68c9C79318d1F3868A354EE67D8c006" as `0x${string}`,
    },
  },
};

export const config = createConfig({
  chains: [bellecour],
  transports: {
    [bellecour.id]: http(),
  },
});
```

add the wagmi provider to our `src/App.tsx` to make it availlable to the child components

```ts
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmiConfig";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <h1>iExec hello world</h1>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
```

## Add a connect button

create `src/ConnectButton.tsx` to connect the user to bellecour

```ts
import { useAccount, useConnect, useDisconnect } from "wagmi";
// use the injected provider (MetaMask) provider, can be changed with other connectors
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
```

integrate the button in our root component `src/App.ts`

```ts
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmiConfig";
import ConnectButton from "./ConnectButton";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <h1>iExec hello world</h1>
        <ConnectButton />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
```

### Build a useIExec hook

create `src/useIExec.ts` react hook to expose the IExec instance to other components.

```ts
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
```

### use iexec in our app components

Examples:

- display the user account: [`src/IExecAccountWidget.tsx`](src/IExecAccountWidget.tsx)
- run an application an get the result: [`src/RunHelloWorld.txs`](src/RunHelloWorld.txs)
