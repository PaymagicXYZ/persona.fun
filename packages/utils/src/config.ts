export const ANON_ADDRESS = "0x0db510e79909666d6dec7f5e49370838c16d950f";
export const COMMENT_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DEGEN_ADDRESS = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
export const CRYPTO_KAREN_ADDRESS =
  "0x08929621710a1b071C47bD02F3Db331095CC7e26";

export const TOKEN_CONFIG: Record<
  string,
  {
    ticker: string;
    postAmount: string;
    promoteAmount: string;
    deleteAmount: string;
    farcasterUsername: string;
    fid: number;
  }
> = {
  [ANON_ADDRESS]: {
    ticker: "ANON",
    postAmount: "5000000000000000000000",
    promoteAmount: "2000000000000000000000000",
    deleteAmount: "2000000000000000000000000",
    farcasterUsername: "anoncast",
    fid: 880094,
  },
  [COMMENT_ADDRESS]: {
    ticker: "COMMENT",
    postAmount: "1",
    promoteAmount: "1",
    deleteAmount: "1",
    farcasterUsername: "comment",
    fid: 880094,
  },
  [DEGEN_ADDRESS]: {
    ticker: "DEGEN",
    postAmount: "0", // 0 for testing
    promoteAmount: "1",
    deleteAmount: "1",
    farcasterUsername: "degen",
    fid: 880094,
  },
  [CRYPTO_KAREN_ADDRESS]: {
    ticker: "CRYPTO KAREN",
    postAmount: "0", // 0 for testing
    promoteAmount: "1",
    deleteAmount: "1",
    farcasterUsername: "cryptokaren",
    fid: 880094,
  },
};

export const USERNAME_TO_ADDRESS: Record<string, string> = Object.entries(
  TOKEN_CONFIG
).reduce((acc, [address, { farcasterUsername }]) => {
  acc[farcasterUsername] = address;
  return acc;
}, {} as Record<string, string>);
