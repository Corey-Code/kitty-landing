import React, {useState} from "react";
import "./inputmodal.css";
import {RiCloseLine} from "react-icons/ri";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {Wormhole, wormhole} from "@wormhole-foundation/sdk";
import {amount, signSendWait, Signer} from "@wormhole-foundation/sdk"
import solana from "@wormhole-foundation/sdk/solana";
import cosmwasm from "@wormhole-foundation/sdk/cosmwasm"
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";

import {useAccount, useConnect, useDisconnect, useStargateSigningClient} from "graz";
import {Transaction, Connection} from "@solana/web3.js";

const AddressDisplay = ({ address }) => {
    const shortenAddress = (address) => {
        const prefix = address.slice(0, 4); // First 4 characters
        const suffix = address.slice(-4);   // Last 4 characters
        return `${prefix}...${suffix}`;
    };

    const shortAddress = shortenAddress(address);

    return <div style={{marginTop: "5px"}}>Address: {shortAddress}</div>;
};

const InputModal = ({setIsOpen}) => {
    const [bridgeAmount, setBridgeAmount] = useState(0);
    const {connection} = useConnection();
    const {publicKey, signTransaction} = useWallet();
    const {isConnected, data: account} = useAccount();
    const { data: signingClient } = useStargateSigningClient()
    const {connect} = useConnect();
    const {disconnect} = useDisconnect();

    const bridge = async () => {
        const wh = await wormhole("Testnet", [solana, cosmwasm]);
        const ctx = wh.getChain("Solana");
        console.log('ctx', ctx);
        const rcv = wh.getChain("Osmosis");
        console.log('rcv', rcv);

        // Get a Token Bridge contract client on the source
        const sndTb = await ctx.getTokenBridge();

        // Send the native token of the source chain
        const tokenId = Wormhole.tokenId(ctx.chain, "native");

        // bigint amount using `amount` module
        const amt = amount.units(amount.parse(bridgeAmount, 18));

        // Create a transaction stream for transfers
        const transfer = sndTb.transfer(publicKey, account.bech32Address, tokenId.address, amt);

        const transaction = new Transaction();
        const newConnection = new Connection("https://api.devnet.solana.com");
        const blockHash = await newConnection.getLatestBlockhash()
        transaction.feePayer = publicKey
        transaction.recentBlockhash = await blockHash.blockhash
        const signedTransaction = await signTransaction(transaction);
        // Sign and send the transaction
        const txids = await signSendWait(ctx, transfer, signedTransaction.signature);
        console.log("Sent: ", txids);

        // Get the wormhole message id from the transaction
        const [whm] = await ctx.parseTransaction(txids[txids.length - 1]?.txid);
        console.log("Wormhole Messages: ", whm);

        // EXAMPLE_WORMHOLE_VAA
        // Get the VAA from the wormhole message id
        const vaa = await wh.getVaa(
            // Wormhole Message ID
            whm,
            // Protocol:Payload name to use for decoding the VAA payload
            "TokenBridge:Transfer",
            // Timeout in milliseconds, depending on the chain and network, the VAA may take some time to be available
            60_000,
         );
        // EXAMPLE_WORMHOLE_VAA

        // Now get the token bridge on the redeem side
        const rcvTb = await rcv.getTokenBridge();

        // Create a transaction stream for redeeming
        const redeem = rcvTb.redeem(signingClient, vaa);

        // Sign and send the transaction
        const rcvTxids = await signSendWait(rcv, redeem, signingClient);
        console.log("Sent: ", rcvTxids);

        // Now check if the transfer is completed according to
        // the destination token bridge
        const finished = await rcvTb.isTransferCompleted(vaa);
        console.log("Transfer completed: ", finished);

    }
    const handleBridge = async () => {
        if (!bridgeAmount) {
            alert("Should input amount");
        }
        await bridge();
    }

    const handleAmountChange = (event) => {
        setBridgeAmount(event.target.value);
    }
    return (
        <>
            <div className="darkBG" onClick={() => setIsOpen(false)}/>
            <div className="centered">
                <div className="modal">
                    <div className="modalHeader">
                        <h5 className="heading">Bridge</h5>
                    </div>
                    <button className="closeBtn" onClick={() => setIsOpen(false)}>
                        <RiCloseLine style={{marginBottom: "0px"}}/>
                    </button>
                    <div className="modalContent">
                        {/*{(connection && publicKey) ?*/}

                        {/*    <div>*/}
                        {/*        You should connect wallet first*/}
                        {/*    </div>*/}
                        {/*}*/}
                        <WalletMultiButton/>
                        <div style={{marginTop: "20px"}}>
                            <label>
                                Amount:
                                <input name="amount" onChange={handleAmountChange} style={{border: "1px solid", marginLeft: "3px"}}/>
                            </label>
                        </div>
                        <div style={{marginTop: "20px"}}>
                            <button className="osmosis"
                                    onClick={() => (isConnected ? disconnect() : connect({chainId: "osmosis"}))}>
                                {isConnected ? "Disconnect" : "Connect Osmosis"}
                            </button>
                        </div>
                        {isConnected && <AddressDisplay address={account?.bech32Address} />}

                    </div>
                    <div className="modalActions">
                        <div className="actionsContainer">
                            <button className="deleteBtn" onClick={handleBridge}
                                    disabled={!(connection && isConnected)}>
                                Bridge
                            </button>
                            <button
                                className="cancelBtn"
                                onClick={() => setIsOpen(false)}
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

export default InputModal;