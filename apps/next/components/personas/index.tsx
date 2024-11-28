import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCreatePost } from "../create-post/context";
import { personas } from "@/lib/api/personas";
import Link from "next/link";
import { Persona } from "@/lib/types/persona";

export default function Personas() {
  const { data } = useQuery({
    queryKey: ["personas"],
    queryFn: personas.getPersonas,
  });

  const { persona, setPersona } = useCreatePost();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto cursor-pointer">
      {data?.map((e) => (
        <PersonaCard
          persona={e}
          setPersona={setPersona}
          selectedPersonaId={persona?.id}
        />
      ))}
    </div>
  );
}

function PersonaCard({
  persona,
  setPersona,
  selectedPersonaId,
}: {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  selectedPersonaId: number | undefined;
}) {
  const isSelected = persona.id === selectedPersonaId;

  return (
    <div
      key={persona.id}
      className={`
        relative flex flex-col items-center justify-center rounded-lg overflow-hidden
        bg-[#1a1a1a] border ${
          isSelected ? "border-blue-500" : "border-[#333]"
        } h-fit p-6 gap-6
      `}
      onClick={() => setPersona(persona)}
    >
      {/* Card Content */}
      <div className="relative w-full">
        <div className="relative h-auto flex-shrink-0 w-full lg:h-[350px] max-lg:w-[350px]">
          <Image
            src={persona.image_url}
            alt="market-image"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">
          {persona.name}
        </h3>
      </div>

      {/* Token Requirements */}
      <div className="flex-1 space-y-4 w-full">
        <h4 className="text-sky-400 font-semibold mb-3">Required Tokens</h4>
        <div className="space-y-2 text-gray-300">
          <div className="flex justify-between items-center">
            <span>POST:</span>
            <span className="font-mono">
              {persona.token.post_amount} {persona.token.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>DELETE:</span>
            <span className="font-mono">
              {persona.token.delete_amount} {persona.token.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>PROMOTE:</span>
            <span className="font-mono">
              {persona.token.promote_amount} {persona.token.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={persona.token.base_scan_url}
            target="_blank"
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Base Scan
          </Link>
          <Link
            href={persona.token.dex_screener_url}
            target="_blank"
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            DEX Screener
          </Link>
        </div>
      </div>
    </div>
  );
}
