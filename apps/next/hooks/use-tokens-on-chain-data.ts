import { tokensApi } from "@/lib/api/tokens";
import { useQuery } from "@tanstack/react-query";

export const useTokensOnChainData = ({
  tokenAddresses,
}: {
  tokenAddresses: string[];
}) => {
  console.log("length,", tokenAddresses.length);
  const { data: tokenData } = useQuery({
    queryKey: ["tokens", tokenAddresses.join(",")],
    queryFn: () =>
      tokensApi.getTokenDexScreenerData({
        tokenAddresses,
      }),
    enabled: tokenAddresses.length > 0,
  });

  return tokenData;
};
