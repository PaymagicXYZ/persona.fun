import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { Logestic } from "logestic";
import {
  Address,
  bytesToHex,
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  keccak256,
  toBytes,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { optimism } from "viem/chains";
import {
  ID_REGISTRY_ADDRESS,
  ViemLocalEip712Signer,
  idRegistryABI,
} from "@farcaster/hub-nodejs";
import { neynar } from "./services/neynar";

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

export const createElysia = (
  config?: ConstructorParameters<typeof Elysia>[0]
) => new Elysia(config).use(cors()).use(Logestic.preset("common"));

// Function to create wallet and generate signature
export const generateNeynarSignature = async (
  name: string,
  fid: number,
  deadline: number
) => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const signer = new ViemLocalEip712Signer(account);

  const nonce = await publicClient.readContract({
    address: ID_REGISTRY_ADDRESS,
    abi: idRegistryABI,
    functionName: "nonces",
    args: [account.address],
  });

  const signature = await signer.signTransfer({
    fid: BigInt(fid),
    to: account.address,
    nonce,
    deadline: BigInt(deadline),
  });

  return {
    signature: bytesToHex(signature._unsafeUnwrap()),
    custodyAddress: account.address,
    privateKey,
  };
};

export const createFCAccount = async (body: { name: string }) => {
  const { fid } = await neynar.getFid();
  console.log("FID", fid);
  // Generate deadline (1 day from now)
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  console.log("DEADLINE", deadline);
  // Generate signature using name and fid
  const { signature, custodyAddress, privateKey } =
    await generateNeynarSignature(body.name, fid, deadline);

  // Prepare registration data
  const registrationData = {
    signature,
    fid,
    requested_user_custody_address: custodyAddress,
    deadline,
    fname: generateRandomId(),
  };

  const response = await neynar.registerUser(registrationData);

  return {
    privateKey,
    address: custodyAddress,
    response,
  };
};

// Function to generate random ID between 1 and 999999
function generateRandomId(): string {
  // Generate random number between 1 and 999999
  const randomNum = Math.floor(Math.random() * 999999) + 1;

  return `p${randomNum}`;
}
