import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ConnectButton } from "@/components/connect-button";
import { Logo } from "@/components/logo";
import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Persona.fun",
  description: "Post anonymously to Farcaster.",
  openGraph: {
    title: "Persona.fun",
    description: "Post anonymously to Farcaster.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.className} antialiased min-h-screen w-full`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col gap-4 p-20">
            <div className="flex items-center justify-between w-full">
              <Logo />
              <ConnectButton />
            </div>
            <div className="flex-1 mt-12">{children}</div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
