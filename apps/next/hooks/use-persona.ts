import { useCreatePost } from "@/components/create-post/context";
import { personas } from "@/lib/api/personas";
import { useQuery } from "@tanstack/react-query";

export default function usePersona(fid: number) {
  const { setPersona } = useCreatePost();

  const { data: persona } = useQuery({
    queryKey: ["persona", fid],
    queryFn: async () => {
      const persona = await personas.getPersonaByFid(fid);

      if (persona) {
        setPersona(persona);
      }

      return persona;
    },
  });

  return persona;
}
