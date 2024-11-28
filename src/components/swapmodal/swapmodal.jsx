import React, {useEffect, useState} from "react";
import "./swapmodal.css";
import { RiCloseLine } from "react-icons/ri";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {Connection, PublicKey} from "@solana/web3.js";
import {getAssociatedTokenAddress, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import { Buffer } from 'buffer';
import {getAvailablePoolKeyAndPoolInfo} from "../../utils/getAvailablePoolKeyAndPoolInfo.js";
import {MAINNET_PROGRAM_ID, Token} from "@raydium-io/raydium-sdk";
import {Market, MARKET_STATE_LAYOUT_V3} from "@project-serum/serum";
import {findProgramAddress, Liquidity, TokenAmount,} from "@raydium-io/raydium-sdk";



const AddressDisplay = ({ address }) => {
  const shortenAddress = (address) => {
    const prefix = address.slice(0, 4); // First 4 characters
    const suffix = address.slice(-4); // Last 4 characters
    return `${prefix}...${suffix}`;
  };

  const shortAddress = shortenAddress(address);

  return <div style={{ marginTop: "5px" }}>Address: {shortAddress}</div>;
};

let main_connection = new Connection("https://nameless-long-lambo.solana-mainnet.quiknode.pro/d225b8dd2d941de138a99a8735d64d319e4680b1");

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
  const { publicKey } = useWallet();

  const [solBalance, setSolBalance] = useState(0);
  const [kittyBalance, setKittyBalance] = useState(0);


  useEffect(() => {
    const fetchPoolInfo = async() => {

      const poolKeys = Liquidity.getAssociatedPoolKeys({
        version: 4,
        marketVersion: 3,
        baseMint: new PublicKey("GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf"),
        quoteMint: new PublicKey("So11111111111111111111111111111111111111112"),
        baseDecimals: 18, // doesn't matter here
        quoteDecimals: 9,
        marketId: new PublicKey("DUFnDNBPndLBQKEWDJRwYWxg7kW3DhFzn2uR4MSz54ef"),
        programId: MAINNET_PROGRAM_ID.AmmV4,
        marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
      });
      console.log('poolKeys', poolKeys);
      const poolInfo = await Liquidity.fetchInfo({
        connection: main_connection,
        poolKeys: poolKeys
      });
      console.log('poolInfo', poolInfo);
    }
    fetchPoolInfo();
  }, []);
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
              <p> Sol Balance : {solBalance} </p>
            </div>
            <div style={{marginTop: "20px"}}>
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
            <div>
              <p> Kitty Balance : {kittyBalance} </p>
            </div>
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
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwapModal;
