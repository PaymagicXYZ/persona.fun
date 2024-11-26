import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PostCastResponse } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateWarpcastUrl(createdCast: PostCastResponse) {
  return `https://warpcast.com/${
    createdCast.cast.author.username
  }/${createdCast.cast.hash.slice(0, 10)}`;
}
