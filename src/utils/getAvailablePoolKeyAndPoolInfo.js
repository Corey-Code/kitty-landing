import {Liquidity, MAINNET_PROGRAM_ID, MARKET_STATE_LAYOUT_V3} from "@raydium-io/raydium-sdk";

export const getAvailablePoolKeyAndPoolInfo = async (
    connection,
    baseToken,
    quoteToken,
    marketAccounts
)  => {
    let bFound = false;
    let count = 0;
    let poolKeys;
    let poolInfo;

    while (bFound === false && count < marketAccounts.length) {
        console.log(`getAvailablePoolKeyAndPoolInfo: checking ${count}`);

        const marketInfo = MARKET_STATE_LAYOUT_V3.decode(
            marketAccounts[count].accountInfo.data
        );

        poolKeys = Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            baseMint: baseToken.mint,
            quoteMint: quoteToken.mint,
            baseDecimals: baseToken.decimals,
            quoteDecimals: quoteToken.decimals,
            marketId: marketAccounts[count].publicKey,
            programId: MAINNET_PROGRAM_ID.AmmV4,
            marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET
        });

        poolKeys.marketBaseVault = marketInfo.baseVault;
        poolKeys.marketQuoteVault = marketInfo.quoteVault;
        poolKeys.marketBids = marketInfo.bids;
        poolKeys.marketAsks = marketInfo.asks;
        poolKeys.marketEventQueue = marketInfo.eventQueue;

        let attempts = 0;
        while (attempts < 5) {
            try {
                poolInfo = await Liquidity.fetchInfo({
                    connection: connection,
                    poolKeys: poolKeys
                });

                bFound = true;
                console.log("getAvailablePoolKeyAndPoolInfo: Success to get pool infos...");
                break;
            } catch (error) {
                attempts ++;
                if ( attempts >= 5) {
                    bFound = false;
                    poolInfo = undefined;
                    poolKeys = undefined;
                }
                console.log("getAvailablePoolKeyAndPoolInfo: Failed to get pool infos...");
                console.log("Retrying 5 seconds....");
                setTimeout(() => {
                }, 5000);
            }
        }

        count++;
    }

    return {
        poolKeys: poolKeys,
        poolInfo: poolInfo
    };
};