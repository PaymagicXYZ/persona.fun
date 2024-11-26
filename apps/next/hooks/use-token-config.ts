import { api } from "@/lib/api";
import { tokenConfig } from "@/lib/api/token-config";
import { useQuery } from "@tanstack/react-query";

export default function useTokenConfig({
  tokenAddress,
}: {
  tokenAddress: string;
}) {
  const { data } = useQuery({
    queryKey: ["token-config", tokenAddress],
    queryFn: () => tokenConfig.getTokenConfig({ tokenAddress }),
  });
}
