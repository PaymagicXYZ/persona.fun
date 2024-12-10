import { Cast } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import AnimatedTabs from "./animated-tabs";
import { Skeleton } from "../ui/skeleton";
import { Post } from "../post";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Label } from "../ui/label";

export default function PostFeed({
  fid,
  defaultTab = "trending",
}: {
  fid: number;
  defaultTab?: "new" | "trending";
}) {
  const [selected, setSelected] = useState<"new" | "trending">(defaultTab);

  const { data: trendingPosts, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["trending", fid],
    queryFn: async (): Promise<Cast[]> => {
      const response = await api.getTrendingPosts(fid);
      return response?.casts || [];
    },
  });

  const { data: newPosts, isLoading: isNewLoading } = useQuery({
    queryKey: ["posts", fid],
    queryFn: async (): Promise<Cast[]> => {
      const response = await api.getNewPosts(fid);
      return response?.casts || [];
    },
  });

  return (
    <div className="flex flex-col gap-4 mt-20">
      <Tabs
        defaultValue={defaultTab}
        className="w-full"
        onValueChange={(value) => setSelected(value as "new" | "trending")}
      >
        <div className="flex justify-center">
          <TabsList className="h-[67px] px-2 bg-[#121212] mb-6">
            <TabsTrigger
              className="h-[57px] data-[state=active]:bg-[#1a1a1a]"
              value="trending"
            >
              <Image
                src="/medal.svg"
                alt="Trending"
                width={34}
                height={41}
                className="mr-1"
              />
              <Label className="leading-7 font-bold text-2xl text-gray-100 cursor-pointer">
                Trending
              </Label>
            </TabsTrigger>
            <TabsTrigger
              className="h-[57px] data-[state=active]:bg-[#1a1a1a]"
              value="new"
            >
              <Image
                src="/new.svg"
                alt="New"
                width={64}
                height={47}
                className="mr-1"
              />
              <Label className="leading-7 font-bold text-2xl text-gray-100 cursor-pointer">
                New
              </Label>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new">
          {isNewLoading ? (
            <SkeletonPosts />
          ) : newPosts?.length && newPosts?.length > 0 ? (
            <Posts casts={newPosts} fid={fid} />
          ) : (
            <h1>Something went wrong. Please refresh the page.</h1>
          )}
        </TabsContent>
        <TabsContent value="trending">
          {isTrendingLoading ? (
            <SkeletonPosts />
          ) : trendingPosts?.length && trendingPosts?.length > 0 ? (
            <Posts casts={trendingPosts} fid={fid} />
          ) : (
            <h1>Something went wrong. Please refresh the page.</h1>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SkeletonPosts() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonPost />
      <SkeletonPost />
      <SkeletonPost />
      <SkeletonPost />
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

function Posts({ casts, fid }: { casts?: Cast[]; fid: number }) {
  return (
    <div className="flex flex-col gap-4">
      {casts?.map((cast) => (
        <Link href={`/posts/${fid}/${cast.hash}`} key={cast.hash}>
          <Post key={cast.hash} cast={cast} fid={fid} />
        </Link>
      ))}
    </div>
  );
}
