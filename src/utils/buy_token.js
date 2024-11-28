import {ComputeBudgetProgram, Connection, Keypair, PublicKey} from "@solana/web3.js";
import {
    buildSimpleTransaction,
    Liquidity,
    LiquidityPoolKeys, LOOKUP_TABLE_CACHE, SPL_ACCOUNT_LAYOUT,
    Token,
    TOKEN_PROGRAM_ID,
    TokenAmount,
    TxVersion
} from "@raydium-io/raydium-sdk";
import {getMint} from "@solana/spl-token";

export const SPL_ERROR = {
    E_INVALID_ARGUE: -1,
    E_OK: 0,
    E_FAIL: 1,
    E_CHECK_FAIL: 2,
}

const getWalletAccounts = async (
    connection,
    wallet
) => {
    const wallet_token_account = await connection.getTokenAccountsByOwner(
        wallet,
        {
            programId: TOKEN_PROGRAM_ID
        }
    );

    return wallet_token_account.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data)
    }));
};

export const buyToken = async (
    connection,
    buyer,
    token_address,
    base_amount,
    quote_amount,
    pool_key
) => {
    if (token_address.length <= 0 || base_amount <= 0) {
        console.error("Error: [Buy Token] invalid argument iput!!!");
        return {result: SPL_ERROR.E_INVALID_ARGUE, value: undefined};
    }

    try {
        const token_mint = new PublicKey(token_address);
        const token_info = await getMint(connection, token_mint);
        const base_token = new Token(
            TOKEN_PROGRAM_ID,
            token_address,
            token_info.decimals
        );
        const quote_info = ({
            address: "So11111111111111111111111111111111111111112",
            decimal: 9,
            name: "WSOL",
            symbol: "WSOL",
        });
        const quote_token = new Token(
            TOKEN_PROGRAM_ID,
            quote_info.address,
            quote_info.decimal,
            quote_info.symbol,
            quote_info.name
        );
        const base_token_amount = new TokenAmount(base_token, base_amount, false);
        const quote_token_amount = new TokenAmount(
            quote_token,
            quote_amount,
            false
        );

        const wallet_token_accounts = await getWalletAccounts(
            connection,
            buyer.publicKey
        );

        const {innerTransactions} = await Liquidity.makeSwapInstructionSimple({
            connection: connection,
            poolKeys: pool_key,
            userKeys: {
                tokenAccounts: wallet_token_accounts,
                owner: buyer.publicKey
            },
            amountIn: quote_token_amount,
            amountOut: base_token_amount,
            fixedSide: "in",
            makeTxVersion: TxVersion.V0,
            computeBudgetConfig: {microLamports: 250000}
        });

        const transactions = await buildSimpleTransaction({
            connection: connection,
            makeTxVersion: TxVersion.V0,
            payer: buyer.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: LOOKUP_TABLE_CACHE,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash
        });

        return {result: SPL_ERROR.E_OK, value: transactions};
    } catch (error) {
        console.error("Error: [buy Tokens] error code: ", error);
        return {result: SPL_ERROR.E_FAIL, value: undefined};
    }
};