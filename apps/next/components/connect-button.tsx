"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";

export const ConnectButton = () => {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-[#C83FD3] py-6 hover:bg-[#C83FD3]/90 text-white text-lg font-bold rounded-xl"
                  >
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 text-white text-lg font-bold rounded-xl "
                  >
                    Switch Network
                  </Button>
                );
              }
              return (
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="bg-[#C83FD3] w-[114px] hover:bg-[#C83FD3]/90 text-white text-lg font-bold rounded-xl"
                >
                  {/* <Balance /> */}
                  <div className="text-base font-bold bg-[#C83FD3 rounded-md py-1.5 px-3 m-0.5">
                    {account.displayName}
                  </div>
                </button>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};
