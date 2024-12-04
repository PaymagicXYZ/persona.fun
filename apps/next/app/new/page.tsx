"use client";

import ActionComponent from "@/components/action";
import { CreatePostProvider } from "@/components/create-post/context";

export default function Home() {
  return (
    <CreatePostProvider>
      <div className="flex flex-col gap-8">
        <ActionComponent />
      </div>
    </CreatePostProvider>
  );
}
