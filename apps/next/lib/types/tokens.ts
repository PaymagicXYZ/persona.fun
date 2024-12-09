export interface TokenResponse {
  id: number;
  address: string;
  name: string;
  symbol: string;
  supply: number;
  post_amount: number;
  delete_amount: number;
  promote_amount: number;
  base_scan_url: string;
  dex_screener_url: string;
  uniswap_url: string;
  pair_address: string;
}

export interface TokenDexScreenerResponse {
  pairs: {
    chainId: string;
    dexId: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceUsd: string;
    priceChange: {
      h24: number;
    };
    liquidity: {
      usd: number;
    };
    volume: {
      h24: number;
    };
    marketCap: number;
  }[];
}

export interface ProcessedTokenData {
  address: string;
  name: string;
  symbol: string;
  marketCap: number;
  priceChangeDay: number;
  liquidity: number;
  volumeDay: number;
  pairCount: number;
  priceUsd: number;
}

export type ProcessedTokensMap = {
  [address: string]: ProcessedTokenData;
};
