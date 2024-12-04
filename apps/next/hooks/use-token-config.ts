import { api } from "@/lib/api";
import { tokensApi } from "@/lib/api/tokens";
import { useQuery } from "@tanstack/react-query";

export default function useToken({ tokenAddress }: { tokenAddress: string }) {
  return useQuery({
    queryKey: ["token", tokenAddress],
    queryFn: () => tokensApi.getToken({ tokenAddress }),
  });
}
