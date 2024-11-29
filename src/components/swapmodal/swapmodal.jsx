import React, {useEffect, useState} from "react";
import "./swapmodal.css";
import { RiCloseLine } from "react-icons/ri";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {Connection, PublicKey} from "@solana/web3.js";
import {getAssociatedTokenAddress, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import { Buffer } from 'buffer';
import {getAvailablePoolKeyAndPoolInfo} from "../../utils/getAvailablePoolKeyAndPoolInfo.js";
import {LIQUIDITY_STATE_LAYOUT_V4, MAINNET_PROGRAM_ID, Percent, Token} from "@raydium-io/raydium-sdk";
import {Market, MARKET_STATE_LAYOUT_V3} from "@project-serum/serum";
import {findProgramAddress, Liquidity, TokenAmount,} from "@raydium-io/raydium-sdk";
import {buyToken} from "../../utils/buy_token.js";
import {signSendWait} from "@wormhole-foundation/sdk";
import {sellToken} from "../../utils/sell_token.js";


const AddressDisplay = ({ address }) => {
  const shortenAddress = (address) => {
    const prefix = address.slice(0, 4); // First 4 characters
    const suffix = address.slice(-4); // Last 4 characters
    return `${prefix}...${suffix}`;
  };

  const shortAddress = shortenAddress(address);

  return <div style={{ marginTop: "5px" }}>Address: {shortAddress}</div>;
};
const solanaUrl = import.meta.env.VITE_SOLANA_URL;
let main_connection = new Connection(solanaUrl);

const getSPLTokenAmount = async (ownerPubKey, token_address) => {
  while (1) {
    try {
      const tokenListResult = await main_connection.getTokenAccountsByOwner(ownerPubKey, {programId: TOKEN_PROGRAM_ID});
      let tokenExist = 0;
      let tokenAmount = 0;
      const tokenCheck = await getAssociatedTokenAddress(new PublicKey(token_address), ownerPubKey);
      tokenListResult.value.forEach((e) => {
        if (e.pubkey.toBase58() === tokenCheck.toBase58()) {
          tokenExist = 1;
        }
      })
      if (tokenExist) {
        const response = await main_connection.getParsedTokenAccountsByOwner(ownerPubKey, {mint: new PublicKey(token_address)});
        tokenAmount = response.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      } else {
        tokenAmount = 0;
      }
      return tokenAmount;
    } catch (error) {
      console.error(`failed:`, error);
      console.log('...Wait 5 seconds till retrying');
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('...Retrying')
    }
  }
}

const SwapModal = ({ setIsSwapOpen }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const [solBalance, setSolBalance] = useState(0);
  const [kittyBalance, setKittyBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [activate, setActivate] = useState(true);
  const [outAmount, setOutAmount] = useState(0);

  useEffect(() => {
    const fetchBalance = async() => {
      if (publicKey) {
        const balance = await main_connection.getBalance(publicKey);
        const _kittyBalance = await getSPLTokenAmount(publicKey, "GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf");

        setSolBalance(balance);
        setKittyBalance(_kittyBalance);
      }
    }
    fetchBalance();
  }, [connection, main_connection, publicKey]);
  useEffect(() => {
    const computeSolAmount = async(in_out, base_amount, slippage) => {
      const base_token = new Token(TOKEN_PROGRAM_ID, new PublicKey("GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf"), 9);
      const quote_token = new Token(TOKEN_PROGRAM_ID, new PublicKey("So11111111111111111111111111111111111111112"), 9);
      const {poolKeys, poolInfo} = await getAvailablePoolKeyAndPoolInfo(main_connection);
      console.log('pool_keys', poolKeys);
      console.log('pool_info', poolInfo);
      console.log('pool_base_Reserve', Number(poolInfo.baseReserve));
      console.log('pool_quote_Reserve', Number(poolInfo.quoteReserve));
      if (in_out) {
        const { minAmountOut } = Liquidity.computeAmountOut({
          poolKeys: poolKeys,
          poolInfo: poolInfo,
          amountIn: new TokenAmount(quote_token, base_amount, false),
          currencyOut: base_token,
          slippage: new Percent(slippage, 100)
        });
        console.log('amountOut', Number(minAmountOut.toExact()) );
        setOutAmount(Number(minAmountOut.toExact()) );
      } else {
        const {minAmountOut} = Liquidity.computeAmountOut({
          poolKeys: poolKeys,
          poolInfo: poolInfo,
          amountIn: new TokenAmount(base_token, base_amount, false),
          currencyOut: quote_token,
          slippage: new Percent(slippage, 100)
        });
        console.log('amountOut', Number(minAmountOut.toExact()));
        setOutAmount(Number(minAmountOut.toExact()));

      }
    }
    computeSolAmount(activate, amount, 0);

  }, [amount, activate]);

  const onSwap = async () => {
    console.log('sss');
    let result;
    const {poolKeys, poolInfo} = await getAvailablePoolKeyAndPoolInfo(main_connection);
    if (activate) {
      console.log('publicKey', publicKey.toBase58(), amount, outAmount);
      result = await buyToken(
          main_connection,
          publicKey,
          "GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf",
          amount,
          outAmount,
          poolKeys
      )
    } else {
      result = await sellToken(
          main_connection,
          publicKey,
          "GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf",
          amount,
          outAmount,
          poolKeys
      )
    }
    console.log('result', result);
    if (result.result !== true) {
      alert(`Error: failed to create buy token transaction`);
    }
    if (
        typeof result.value !== "string" &&
        Array.isArray(result.value)
    ) {
      result.value[0].recentBlockhash = (await main_connection.getLatestBlockhash()).blockhash;
      const txn = await signTransaction(result.value[0]);
      const signature = await sendTransaction(txn, main_connection);

      alert(`Token Transfer Successfully Confirmed! 🎉 View on SolScan: https://solscan.io/tx/${signature}`);
    }
  }
  return (
    <>
      <div className="darkBG" onClick={() => setIsSwapOpen(false)} />
      <div className="centered">
        <div className="modal">
          <div className="modalHeader">
            <h5 className="heading">Swap</h5>
          </div>
          <button className="closeBtn" onClick={() => setIsSwapOpen(false)}>
            <RiCloseLine style={{ marginBottom: "0px" }} />
          </button>
          <div className="modalContent">
            {/*{(connection && publicKey) ?*/}

            {/*    <div>*/}
            {/*        You should connect wallet first*/}
            {/*    </div>*/}
            {/*}*/}

            <WalletMultiButton style={{borderRadius: "16px"}}/>
            <div>
              <button
                  className="deleteBtn"
                  onClick={() => setActivate(true)}
              >
                Buy
              </button>
              <button
                  className="deleteBtn"
                  onClick={() => setActivate(false)}
              >
                Sell
              </button>
            </div>
            {activate ?
                <div>
                  <p> Sol Balance : {solBalance} </p>
                </div> :
                <div>
                  <p> Kitty Balance : {kittyBalance} </p>
                </div>
            }

            <div style={{marginTop: "20px"}}>
              <input
                  className="inputBox"
                  name="number"
                  type="text"
                  placeholder="Amount"
                  style={{
                    color: "#1a1f2e",
                    border: "1px solid",
                    marginLeft: "3px",
                  }}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div>
              <p>You will get {outAmount < 1e-6 ? "0" : outAmount.toFixed(6)} {activate? "Kitty" : "Sol"}</p>
            </div>
            <div>
              <button
                  className="deleteBtn"
                  onClick={() => onSwap()}
              >
                Swap
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwapModal;
