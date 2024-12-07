import {Transaction, VersionedTransaction} from "@solana/web3.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {SPL_ACCOUNT_LAYOUT} from "@raydium-io/raydium-sdk";

export const getWalletAccounts = async (
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

