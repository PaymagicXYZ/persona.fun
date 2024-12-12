import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ConnectButton } from "@/components/connect-button";
import { Logo } from "@/components/logo";
import { Instrument_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Create an Intern agent+token",
  description: "Automate your social media 24/7 and tip your biggest fans",
  openGraph: {
    title: "Create an Intern agent+token",
    description: "Automate your social media 24/7 and tip your biggest fans",
    siteName: "Interns.fun",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: ["/favicon.ico"],
    apple: ["/apple-touch-icon.png"],
    shortcut: ["/apple-touch-icon.png"],
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
      <GoogleAnalytics gaId="G-Z6EFBFGRL6" />
    </html>
  );
}
