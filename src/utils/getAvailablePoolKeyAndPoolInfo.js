import {Liquidity, MAINNET_PROGRAM_ID, MARKET_STATE_LAYOUT_V3} from "@raydium-io/raydium-sdk";
import {Market} from "@project-serum/serum";
import {PublicKey} from "@solana/web3.js";

export const getAvailablePoolKeyAndPoolInfo = async (
    connection,
)  => {
    const accounts = await Market.findAccountsByMints(
        connection,
        new PublicKey("GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf"),
        new PublicKey("So11111111111111111111111111111111111111112"),
        MAINNET_PROGRAM_ID.OPENBOOK_MARKET
    );

    if (accounts.length <= 0) {
        throw "Error: Market not found";
    }
    const marketInfo = MARKET_STATE_LAYOUT_V3.decode(
        accounts[0].accountInfo.data
    );

    const poolKeys = Liquidity.getAssociatedPoolKeys({
        version: 4,
        marketVersion: 3,
        baseMint: new PublicKey("GJghk4JujTRoxzNZwfpFHhUGDitVXxwMio1a5QxNZjPf"),
        quoteMint: new PublicKey("So11111111111111111111111111111111111111112"),
        baseDecimals: 9, // doesn't matter here
        quoteDecimals: 9,
        marketId: accounts[0].publicKey,
        programId: MAINNET_PROGRAM_ID.AmmV4,
        marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    });
    poolKeys.marketBaseVault = marketInfo.baseVault;
    poolKeys.marketQuoteVault = marketInfo.quoteVault;
    poolKeys.marketBids = marketInfo.bids;
    poolKeys.marketAsks = marketInfo.asks;
    poolKeys.marketEventQueue = marketInfo.eventQueue;

    let attempts = 0;
    let poolInfo;
    while (attempts < 5) {
        try {
            poolInfo = await Liquidity.fetchInfo({
                connection: connection,
                poolKeys: poolKeys
            });

            console.log("getAvailablePoolKeyAndPoolInfo: Success to get pool infos...");
            break;
        } catch (error) {
            attempts ++;
            if ( attempts >= 5) {
                poolInfo = undefined;
            }
            console.log("getAvailablePoolKeyAndPoolInfo: Failed to get pool infos...");
            console.log("Retrying 5 seconds....");
            setTimeout(() => {
            }, 5000);
        }
    }


    return {
        poolKeys: poolKeys,
        poolInfo: poolInfo
    };
};