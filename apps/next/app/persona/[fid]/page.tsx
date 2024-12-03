"use client";

import ActionComponent from "@/components/action";
import { useCreatePost } from "@/components/create-post/context";
import PostFeed from "@/components/post-feed";
import { personas } from "@/lib/api/personas";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Page({ params }: { params: { fid: string } }) {
  const fid = parseInt(params.fid);
  const { setPersona } = useCreatePost();

  const { data: persona } = useQuery({
    queryKey: ["persona", fid],
    queryFn: () => personas.getPersonaByFid(fid),
  });

  useEffect(() => {
    if (!persona) {
      return;
    }

    setPersona(persona);
  }, [persona]);

  return (
    <div className="flex flex-col gap-8 max-w-screen-sm mx-auto">
      <ActionComponent />
      <div className="flex h-screen flex-col py-4 gap-8">
        <PostFeed fid={fid} />
      </div>
    </div>
  );
}
