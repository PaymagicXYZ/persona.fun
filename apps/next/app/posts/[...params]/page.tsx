"use client";

import { useQueries } from "@tanstack/react-query";
import { CreatePostProvider } from "@/components/create-post/context";
import { Post } from "@/components/post";
import { api } from "@/lib/api";
import { personasApi } from "@/lib/api/personas";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Cast } from "@/lib/types";

/**
 * This page is used to view a post by fid and its hash.
 */

export default function Page({
  params: { params },
}: {
  params: { params: string[] };
}) {
  const [fid, hash] = params;

  const results = useQueries({
    queries: [
      {
        queryKey: ["post", hash],
        queryFn: () => api.getPost(hash),
      },
      {
        queryKey: ["persona", fid],
        queryFn: () => personasApi.getPersonaByFid(Number(fid)),
      },
    ],
  });

  const [castResult, personaResult] = results;

  const isLoading = castResult.isLoading || personaResult.isLoading;
  const isError = castResult.isError || personaResult.isError;
  const cast = castResult.data;
  const persona = personaResult.data;

  if (!isLoading && (isError || !cast || !persona)) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 max-w-screen-sm mx-auto">
      {isLoading ? (
        <SkeletonPost />
      ) : (
        <Post cast={cast as Cast} fid={Number(fid)} />
      )}
    </div>
  );
}

function SkeletonPost() {
  return (
    <div className="relative [overflow-wrap:anywhere] bg-[#111111] rounded-xl overflow-hidden">
      <div className="flex flex-col gap-4 border p-4 sm:p-6 rounded-xl">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>

        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}
