import { tokensApi } from "@/lib/api/tokens";
import { useQuery } from "@tanstack/react-query";

export default function useTokenBySymbol(symbol: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["token", symbol],
    queryFn: () => tokensApi.getTokenBySymbol({ symbol }),
  });

  return data;
}
