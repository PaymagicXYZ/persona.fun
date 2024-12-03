"use client";

import Image from "next/image";
import { Label } from "./ui/label";

export function Logo() {
  const handleClick = () => {
    window.location.href = "/";
  };

  return (
    <div
      className="text-lg font-bold flex flex-row items-center font-geist cursor-pointer"
      onClick={handleClick}
    >
      <Image
        src="/logo.svg"
        alt="persona-logo"
        className="mr-3"
        width={39}
        height={39}
      />
      <Label className="text-[33.94px] leading-[33.94px] font-semibold cursor-pointer">
        Persona.fun
      </Label>
    </div>
  );
}
