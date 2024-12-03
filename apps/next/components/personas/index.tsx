import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useCreatePost } from '../create-post/context'
import { personas } from '@/lib/api/personas'
import Link from 'next/link'
import type { Persona } from '@/lib/types/persona'
import { useRouter } from 'next/navigation'
import { formatEther } from 'viem'

export default function Personas() {
  const { data } = useQuery({
    queryKey: ['personas'],
    queryFn: personas.getPersonas,
  })
  const { persona, setPersona } = useCreatePost()

  // const mockData = [
  //   ...(data ?? []),
  //   ...(data ?? []),
  //   ...(data ?? []),
  //   ...(data ?? []),
  //   ...(data ?? []),
  // ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 w-full max-w-[1920px] mx-auto cursor-pointer">
      {data?.map((e) => (
        <PersonaCard
          key={e.id}
          persona={e}
          setPersona={setPersona}
          selectedPersonaId={persona?.id}
        />
      ))}
    </div>
  )
}

function PersonaCard({
  persona,
  setPersona,
  selectedPersonaId,
}: {
  persona: Persona
  setPersona: (persona: Persona) => void
  selectedPersonaId: number | undefined
}) {
  const router = useRouter()

  const handleCardClick = (persona: Persona) => {
    setPersona(persona)
    router.push(`/persona/${persona.fid}`)
  }

  return (
    <div
      key={persona.id}
      className={`
        relative flex flex-col items-center justify-center rounded-lg overflow-hidden
        bg-[#1a1a1a] border border-[#333] h-fit p-4 gap-4
      `}
      onClick={() => handleCardClick(persona)}
    >
      {/* Card Content */}
      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
        <Image
          src={persona.image_url}
          alt="market-image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-lg"
        />
      </div>
      <h3 className="p-0 text-2xl font-semibold text-white left-0 text-left justify-self-start mr-auto">
        {persona.name}
      </h3>
      <PersonaTokenRequirements persona={persona} />
      <PersonaFooterLinks persona={persona} />
    </div>
  )
}

function PersonaTokenRequirements({ persona }: { persona: Persona }) {
  return (
    <div className="flex-1 space-y-4 w-full">
      <h4 className="text-white font-extralight mb-3 text-xl">Required Tokens</h4>
      <div className="space-y-2 text-gray-300">
        <div className="flex justify-between items-center text-[#9A9A9A]">
          <span>Post:</span>
          <span className="font-mono">
            {formatEther(BigInt(persona.token?.post_amount ?? 0))} {persona.token?.symbol}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#9A9A9A]">
          <span>Delete:</span>
          <span className="font-mono">
            {formatEther(BigInt(persona.token?.delete_amount ?? 0))} {persona.token?.symbol}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#9A9A9A]">
          <span>Promote:</span>
          <span className="font-mono">
            {formatEther(BigInt(persona.token?.promote_amount ?? 0))} {persona.token?.symbol}
          </span>
        </div>
      </div>
    </div>
  )
}

function PersonaFooterLinks({ persona }: { persona: Persona }) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <Link
          href={persona.token?.base_scan_url ?? ''}
          target="_blank"
          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-[#CD52D7] bg-[#2B112E] rounded-lg hover:bg-[#331537] transition-colors"
        >
          Basescan
        </Link>
        <Link
          href={persona.token?.dex_screener_url ?? ''}
          target="_blank"
          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-[#CD52D7] bg-[#2B112E] rounded-lg hover:bg-[#331537] transition-colors"
        >
          Dexscreener
        </Link>
      </div>
    </div>
  )
}
