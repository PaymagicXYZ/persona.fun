import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCreatePost } from "../create-post/context";
import { personas } from "@/lib/api/personas";
import Link from "next/link";

export default function Personas() {
  const { data } = useQuery({
    queryKey: ["personas"],
    queryFn: personas.getPersonas,
  });

  const { persona, setPersona } = useCreatePost();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 w-full max-w-7xl mx-auto cursor-pointer">
      {data?.map((e) => (
        <div
          key={e.id}
          className={`
            relative flex flex-col h-[420px] rounded-xl overflow-hidden
            bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300
            ${
              persona?.id === e.id
                ? "ring-2 ring-sky-500"
                : "hover:ring-1 hover:ring-sky-400"
            }
          `}
          onClick={() => setPersona(e)}
        >
          {/* Header with Image and Name */}
          <div className="relative h-40 bg-gradient-to-b from-sky-500/20 to-gray-900/20">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-sky-500/30 shadow-lg">
                <Image
                  src={e.image_url}
                  alt={e.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="mt-2 text-xl font-bold text-white">{e.name}</h3>
            </div>
          </div>

          {/* Token Requirements */}
          <div className="flex-1 p-6 space-y-4">
            <h4 className="text-sky-400 font-semibold mb-3">Required Tokens</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between items-center">
                <span>POST:</span>
                <span className="font-mono">
                  {e.token.post_amount} {e.token.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>DELETE:</span>
                <span className="font-mono">
                  {e.token.delete_amount} {e.token.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>PROMOTE:</span>
                <span className="font-mono">
                  {e.token.promote_amount} {e.token.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="p-4 bg-gray-800/50">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={e.token.base_scan_url}
                target="_blank"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
              >
                Base Scan
              </Link>
              <Link
                href={e.token.dex_screener_url}
                target="_blank"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
              >
                DEX Screener
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
