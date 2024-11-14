import { SmartWalletSDK } from '@asgarovf/smart-wallet-sdk';

const contracts: Record<string, string> = {
    batchCaller: '0xbbb358a6743C51369901625461CEE02d5245D5a6',
    implementation: '0xEcDa750194Aba47CD1c98F8EfF96FFC745143c61',
    registry: '0x9Bce9ac10c1B9B738Ed76859888A1F59B39de188',
    gaslessPaymaster: '0x89C693864F815323000DB294F69663d3C10bad92',
    claveProxy: '0xed267e8511ff51fFbF5291E7951ae6B25cDC0350',
    passkeyValidator: '0x09d1A340700743a2f3E18b9405966b5867A7fBdd',
    accountFactory: '0x4b0d8580EA014B614259ee1c994Ef896989aA9B2',
};

export const sdk = new SmartWalletSDK({
    chainId: 300,
    contracts,
});
