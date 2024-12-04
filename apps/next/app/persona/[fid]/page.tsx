"use client";

import ActionComponent from "@/components/action";
import PostFeed from "@/components/post-feed";
import usePersona from "@/hooks/use-persona";

export default function Page({ params }: { params: { fid: string } }) {
  const fid = parseInt(params.fid);

  usePersona(fid);

  return (
    <div className="flex flex-col gap-8 max-w-screen-sm mx-auto">
      <ActionComponent />
      <div className="flex h-screen flex-col py-4 gap-8">
        <PostFeed fid={fid} />
      </div>
    </div>
  );
}
