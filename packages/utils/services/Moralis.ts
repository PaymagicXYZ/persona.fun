interface TokenHolder {
  address: string;
  balance: string;
}

interface MoralisTokenHolder {
  balance: string;
  balance_formatted: string;
  is_contract: boolean;
  owner_address: string;
  owner_address_label: string | null;
  entity: string | null;
  entity_logo: string | null;
  usd_value: string;
  percentage_relative_to_total_supply: number;
}

interface MoralisResponse {
  cursor: string | null;
  page: number;
  page_size: number;
  result: MoralisTokenHolder[];
}

class MoralisService {
  private static instance: MoralisService;
  private readonly apiKey: string;
  private readonly baseUrl = "https://deep-index.moralis.io/api/v2.2";

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static getInstance(): MoralisService {
    if (!MoralisService.instance) {
      const apiKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ5NzlmOTQ1LWIyZmYtNDQyMC1iNjhlLTk0MzllZDE0YWE2MCIsIm9yZ0lkIjoiODg0MTkiLCJ1c2VySWQiOiI4ODA2MSIsInR5cGVJZCI6ImVkZDJiM2Q3LTEzNzYtNGU0ZS05YjhmLTMyYmU1NjMwNDMwMSIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzMzODE5NjQ3LCJleHAiOjQ4ODk1Nzk2NDd9.Krt9muJXnOiP9dCsNEm_4_u1fd-bUseg2kq6QV-RC1A";
      if (!apiKey) {
        throw new Error("MORALIS_API_KEY environment variable is not set");
      }
      MoralisService.instance = new MoralisService(apiKey);
    }
    return MoralisService.instance;
  }

  async fetchAllTokenHolders(
    tokenAddress: string,
    minAmount: string = "0",
    chainName: string = "base"
  ): Promise<TokenHolder[]> {
    const holders: TokenHolder[] = [];
    const MAX_PAGES = 10;
    let pageCount = 0;
    let cursor: string | null = null;

    while (pageCount < MAX_PAGES) {
      try {
        // Build URL
        const url = new URL(`${this.baseUrl}/erc20/${tokenAddress}/owners`);
        url.searchParams.append("chain", chainName);
        url.searchParams.append("order", "DESC");
        if (cursor) {
          url.searchParams.append("cursor", cursor);
        }

        console.log(`Fetching from URL: ${url.toString()}`);

        // Make request
        const response = await fetch(url.toString(), {
          headers: {
            "X-API-Key": this.apiKey,
          },
        });

        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`Error details: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MoralisResponse = await response.json();

        // Process holders
        for (const holder of data.result) {
          if (BigInt(holder.balance) >= BigInt(minAmount)) {
            holders.push({
              address: holder.owner_address.toLowerCase(),
              balance: holder.balance,
            });
          }
        }

        // Log progress
        console.log(
          `Processed page ${pageCount + 1}, current holders: ${holders.length}`
        );

        // Check if we have more pages
        if (!data.cursor) {
          console.log("No more pages (cursor is null)");
          break;
        }

        cursor = data.cursor;
        pageCount++;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    }

    if (pageCount >= MAX_PAGES) {
      console.warn(
        `Reached maximum number of pages (${MAX_PAGES}), some results may be missing`
      );
    }

    console.log(`Final holders count: ${holders.length}`);
    return holders;
  }

  // Original method kept for backward compatibility
  async getTokenHolders(
    tokenAddress: string = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    chainName: string = "base"
  ): Promise<Response> {
    console.log(0);
    const response = await fetch(
      `${this.baseUrl}/erc20/${tokenAddress}/owners?chain=${chainName}&order=DESC`,
      {
        headers: {
          "X-API-Key": this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch token holders");
    }

    return response;
  }
}

export const moralisService = MoralisService.getInstance();
