import { personas } from "@/lib/api/personas";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

export default function Characters() {
  const { data, isLoading } = useQuery({
    queryKey: ["personas"],
    queryFn: personas.getPersonas,
  });

  return (
    <div className="flex flex-wrap gap-4">
      {data?.map((e) => (
        <div
          key={e.id}
          className="flex flex-col items-center gap-4 p-2 border border-sky-500 rounded-md"
        >
          <Image src={e.image_url} alt={e.name} width={100} height={100} />
          <span>{e.name}</span>
          <span>
            Required tokens: {e.token.min_token_amount} {e?.token?.symbol}
          </span>
        </div>
      ))}
    </div>
  );
}
