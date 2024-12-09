import { tokensApi } from "@/lib/api/tokens";
import { useQuery } from "@tanstack/react-query";

export const useTokenHolders = ({
  tokenAddresses,
}: {
  tokenAddresses: string[];
}) => {
  const { data: tokenHoldersData } = useQuery({
    queryKey: ["tokenHolders", tokenAddresses.join(",")],
    queryFn: () =>
      tokensApi.getTokenHolders({
        tokenAddresses,
      }),
    enabled: tokenAddresses.length > 0,
  });

  return tokenHoldersData;
};
