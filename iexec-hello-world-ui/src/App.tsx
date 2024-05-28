import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmiConfig";
import ConnectButton from "./ConnectButton";
import IExecAccountWidget from "./IExecAccountWidget";
import RunHelloWorld from "./RunHelloWorld";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 3rem",
            }}
          >
            <h1>iExec hello world</h1>
            <div style={{ margin: "auto 0 auto auto" }}>
              <ConnectButton />
            </div>
          </div>
          <div style={{ padding: "1rem 3rem", display: "grid", gap: "1rem" }}>
            <IExecAccountWidget />
            <RunHelloWorld />
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
