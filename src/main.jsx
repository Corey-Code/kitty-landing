import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Web3PhantomProvider from "./provider";
import { GrazProvider, WalletType } from "graz";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

const cosmoshub = {
  chainId: "osmosis",
  chainName: "Osmosis",
};

createRoot(document.getElementById("root")).render(
  <Web3PhantomProvider>
    <GrazProvider
      grazOptions={{ chains: [cosmoshub], defaultWalletType: WalletType.KEPLR }}
    >
      <StrictMode>
        <App />
      </StrictMode>
      ,
    </GrazProvider>
  </Web3PhantomProvider>
);
