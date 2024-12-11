import { useCreatePost } from "@/components/create-post/context";
import { personasApi } from "@/lib/api/personas";
import { useQuery } from "@tanstack/react-query";

export default function usePersonaByTokenId(tokenId?: number) {
  const { setPersona } = useCreatePost();

  const { data: persona } = useQuery({
    queryKey: ["persona", tokenId],
    queryFn: async () => {
      const persona = await personasApi.getPersonaByTokenId(tokenId!);

      if (persona) {
        setPersona(persona);
      }

      return persona;
    },
    enabled: !!tokenId,
  });

  return persona;
}
