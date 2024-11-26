import { publicClient } from "@/app/actions/create-post/page";
import { useEffect, useState } from "react";
import { erc20Abi } from "viem";

type BalancesMap = Record<string, bigint | null>;

export default function useBalances(
  userAddress: string,
  tokenAddresses: string[]
) {
  const [balances, setBalances] = useState<BalancesMap>({});

  useEffect(() => {
    async function fetchBalances() {
      if (!userAddress || tokenAddresses.length === 0) return;

      try {
        const results = await publicClient.multicall({
          contracts: tokenAddresses.map((tokenAddress) => ({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [userAddress as `0x${string}`],
          })),
        });

        const fetchedBalances: BalancesMap = {};
        tokenAddresses.forEach((tokenAddress, index) => {
          const result = results[index];
          fetchedBalances[tokenAddress] =
            result.status === "success"
              ? BigInt(result.result as string)
              : null;
        });

        setBalances(fetchedBalances);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    }

    fetchBalances();
  }, [userAddress, tokenAddresses]);

  return balances;
}
