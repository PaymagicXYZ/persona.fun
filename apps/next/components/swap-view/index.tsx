// import { Widget } from "@kyberswap/widgets";
// import { ethers } from "ethers";
// import { useState, useEffect } from "react";

// interface SwapWidgetProps {
//   chainId?: number;
//   theme?: "dark" | "light";
//   width?: string | number;
//   height?: string | number;
// }

// const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");

// const DexToolsSwap = ({
//   chainId = 8453, // Base network
//   theme = "dark",
//   width = "100%",
//   height = "600px",
// }: SwapWidgetProps) => {
//   const [showWidget, setShowWidget] = useState(false);

//   useEffect(() => {
//     setTimeout(() => {
//       setShowWidget(true);
//     }, 1000);
//   }, []);

//   // useEffect(() => {
//   //   const setupProvider = async () => {
//   //     try {
//   //       const newProvider = new JsonRpcProvider("https://base.llamarpc.com", {
//   //         chainId: chainId,
//   //         name: "Base",
//   //       });

//   //       await newProvider.ready;
//   //       setProvider(newProvider);
//   //     } catch (error) {
//   //       console.error("Provider setup error:", error);
//   //     }
//   //   };

//   //   setupProvider();
//   // }, [chainId]);

//   // Token configuration
//   const tokens = {
//     defaultTokenIn: "0x4200000000000000000000000000000000000006", // WETH on Base
//     defaultTokenOut: "0x9a11e38A2bcf287c912ae575bB803AC6CE211c28", // Your specified token
//   };

//   // const MY_TOKEN_LIST = [
//   //   {
//   //     name: "KNC",
//   //     address: "0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C",
//   //     symbol: "KNC",
//   //     decimals: 18,
//   //     chainId: 1,
//   //     logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/9444.png",
//   //   },
//   //   {
//   //     name: "Tether USD",
//   //     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
//   //     symbol: "USDT",
//   //     decimals: 6,
//   //     chainId: 1,
//   //     logoURI:
//   //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
//   //   },
//   //   {
//   //     name: "USD Coin",
//   //     address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//   //     symbol: "USDC",
//   //     decimals: 6,
//   //     chainId: 1,
//   //     logoURI:
//   //       "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
//   //   },
//   // ];

//   return (
//     showWidget && (
//       <Widget
//         client="companyName"
//         defaultTokenIn={tokens.defaultTokenIn}
//         defaultTokenOut={tokens.defaultTokenOut}
//         // tokenList={MY_TOKEN_LIST}
//         enableRoute={true}
//         enableDexes="kyberswap-elastic,uniswapv3,uniswap"
//         provider={provider}
//         title={<div>Swap</div>}
//         feeSetting={{
//           feeAmount: 100,
//           feeReceiver: "0xDcFCD5dD752492b95ac8C1964C83F992e7e39FA9",
//           chargeFeeBy: "currency_in",
//           isInBps: true,
//         }}
//       />
//     )
//   );
// };

// export default DexToolsSwap;
