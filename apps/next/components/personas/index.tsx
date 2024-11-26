import { personas } from "@/lib/api/personas";
import { Persona } from "@/lib/types/persona";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { useCreatePost } from "../create-post/context";

export default function Personas() {
  const { data, isLoading } = useQuery({
    queryKey: ["personas"],
    queryFn: personas.getPersonas,
  });

  const { persona, setPersona } = useCreatePost();

  return (
    <div className="flex flex-wrap gap-4">
      {data?.map((e) => (
        <div
          key={e.id}
          className={
            "flex flex-col items-center cursor-pointer gap-4 p-2 border border-sky-500 rounded-md" +
            (persona?.id === e.id ? "border-2 border-red-500" : "")
          }
          onClick={() => setPersona(e)}
        >
          <Image src={e.image_url} alt={e.name} width={100} height={100} />
          <span>{e.name}</span>
          <span>
            Required tokens: {e.token.post_amount} {e?.token?.symbol}
          </span>
        </div>
      ))}
    </div>
  );
}
