import React from "react";
import "./bridgemodal.css";
import { RiCloseLine } from "react-icons/ri";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { wormhole } from "@wormhole-foundation/sdk";
import { Wormhole, amount, signSendWait } from "@wormhole-foundation/sdk";
import solana from "@wormhole-foundation/sdk/solana";
import cosmwasm from "@wormhole-foundation/sdk/cosmwasm";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAccount, useConnect, useDisconnect } from "graz";

const AddressDisplay = ({ address }) => {
  const shortenAddress = (address) => {
    const prefix = address.slice(0, 4); // First 4 characters
    const suffix = address.slice(-4); // Last 4 characters
    return `${prefix}...${suffix}`;
  };

  const shortAddress = shortenAddress(address);

  return <div style={{ marginTop: "5px" }}>Address: {shortAddress}</div>;
};

const BridgeModal = ({ setIsBridgeOpen }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { isConnected, data: account } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const bridge = async () => {
    const wh = await wormhole("Testnet", [solana, cosmwasm]);
    const ctx = wh.getChain("Solana");
    const rcv = wh.getChain("Cosmoshub");
  };
  return (
    <>
      <div className="darkBG" onClick={() => setIsBridgeOpen(false)} />
      <div className="centered">
        <div className="modal">
          <div className="modalHeader">
            <h5 className="heading">Bridge</h5>
          </div>
          <button className="closeBtn" onClick={() => setIsBridgeOpen(false)}>
            <RiCloseLine style={{ marginBottom: "0px" }} />
          </button>
          <div className="modalContent">
            {/*{(connection && publicKey) ?*/}

            {/*    <div>*/}
            {/*        You should connect wallet first*/}
            {/*    </div>*/}
            {/*}*/}

            <WalletMultiButton style={{ borderRadius: "16px" }} />

            <div style={{ marginTop: "20px" }}>
              <input
                className="inputBox"
                name="amount"
                type="number"
                placeholder="Amount"
                style={{
                  color: "#1a1f2e",
                  border: "1px solid",
                  marginLeft: "3px",
                }}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                className="osmosis"
                onClick={() =>
                  isConnected ? disconnect() : connect({ chainId: "osmosis" })
                }
              >
                {isConnected ? "Disconnect" : "Connect Osmosis"}
              </button>
            </div>
            {isConnected && <AddressDisplay address={account?.bech32Address} />}
          </div>
          <div className="modalActions">
            <div className="actionsContainer">
              <button
                className="secondaryBtn"
                onClick={() => setIsBridgeOpen(false)}
                disabled={!(connection && isConnected)}
              >
                Bridge
              </button>
              <button
                className="cancelBtn"
                onClick={() => setIsBridgeOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BridgeModal;
