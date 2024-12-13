import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Web3PhantomProvider from "./provider";
import { GrazProvider, WalletType } from "graz";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);
import { MoonPayProvider } from "@moonpay/moonpay-react";

const cosmoshub = {
  chainId: "osmosis",
  chainName: "Osmosis",
};

const moonpayKey = "pk_test_pKULLlqQbOAEd7usXz7yUiVCc8yNBNGY";

createRoot(document.getElementById("root")).render(
  <MoonPayProvider apiKey={moonpayKey} debug>
    <Web3PhantomProvider>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub],
          defaultWalletType: WalletType.KEPLR,
        }}
      >
        <StrictMode>
          <App />
        </StrictMode>
      </GrazProvider>
    </Web3PhantomProvider>
  </MoonPayProvider>
);
