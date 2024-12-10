// import React, { createContext, useContext, useEffect, useState } from "react";
// import { getUserFromLS, setUserInLS } from "@/lib/localStorage";
// import { usersApi } from "@/lib/api/users";
// import { useAccount, useSignTypedData } from "wagmi";
// import { UserResponse } from "@/lib/types/users";
// import {
//   REGISTER_DOMAIN,
//   REGISTER_TYPES,
//   VERIFY_DOMAIN,
//   VERIFY_TYPES,
// } from "@/lib/utils";

// interface UserContextType {
//   user: UserResponse | null;
//   setUser: (user: UserResponse | null) => void;
//   isLoading: boolean;
//   signUp: (displayName: string) => Promise<void>;
//   logout: () => void;
//   checkUserExists: () => Promise<boolean>;
//   signature: string | null;
//   setSignature: (value: string | null) => void;
//   setNeedsSignUp: (value: boolean) => void;
//   needsSignUp: boolean;
//   handleAddressChange: () => Promise<void>;
// }

// const NEEDS_SIGNUP_KEY = "needs_signup";
// const SIGNATURE_KEY = "stored_signature";
// const USER_ADDRESS_KEY = "last_user_address";

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<UserResponse | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [signature, setSignature] = useState<string | null>(null);
//   const [needsSignUp, setNeedsSignUp] = useState(false);
//   const { signTypedDataAsync } = useSignTypedData();
//   const { address, isDisconnected } = useAccount();

//   const handleAddressChange = async () => {
//     if (!address) return;

//     try {
//       const message =
//         "Welcome! Please sign this message to verify your identity.";
//       const sig = await signTypedDataAsync({
//         domain: VERIFY_DOMAIN,
//         types: VERIFY_TYPES,
//         primaryType: "Verify",
//         message: { message },
//       });

//       setSignature(sig);

//       const userData = await usersApi.verify(sig, { message });

//       if (userData?.verificationToken) {
//         setNeedsSignUp(true);
//       } else {
//         setUser(userData!);
//         setUserInLS(userData!);
//         localStorage.setItem(USER_ADDRESS_KEY, address);
//       }
//     } catch (error) {
//       console.error("Address change verification failed:", error);
//       logout();
//     }
//   };

//   useEffect(() => {
//     const initializeUserState = async () => {
//       if (!address) {
//         setIsLoading(false);
//         return;
//       }

//       const storedUser = getUserFromLS();
//       const lastAddress = localStorage.getItem(USER_ADDRESS_KEY);

//       if (storedUser) {
//         if (lastAddress && lastAddress !== address) {
//           // Address changed - trigger verification flow
//           await handleAddressChange();
//         } else {
//           // Address matches or no last address - keep the user
//           setUser(storedUser);
//           localStorage.setItem(USER_ADDRESS_KEY, address);
//         }
//         setIsLoading(false);
//         return;
//       }

//       // Rest of initialization for new users
//       const storedSignature = localStorage.getItem(
//         `${SIGNATURE_KEY}_${address}`
//       );

//       if (storedSignature) {
//         setSignature(storedSignature);
//         await checkUserExists();
//       }

//       setIsLoading(false);
//     };

//     initializeUserState();
//   }, [address]);

//   useEffect(() => {
//     // Skip the first render/page load
//     if (isDisconnected && address) {
//       logout();
//     }
//   }, [isDisconnected, address]);

//   const checkUserExists = async () => {
//     if (!address) return false;
//     try {
//       const user = await usersApi.getByAddress(address);
//       if (user) {
//         setUserInLS(user);
//         setUser(user);
//         localStorage.setItem(USER_ADDRESS_KEY, address);
//         setNeedsSignUp(false);
//         localStorage.removeItem(`${NEEDS_SIGNUP_KEY}_${address}`);
//         return true;
//       }
//       // Mark that signup is needed
//       setNeedsSignUp(true);
//       localStorage.setItem(`${NEEDS_SIGNUP_KEY}_${address}`, "true");
//       return false;
//     } catch (error) {
//       console.error("Error checking user:", error);
//       return false;
//     }
//   };

//   const signUp = async (displayName: string) => {
//     try {
//       let finalSignature = signature;

//       // Get new signature if we don't have one
//       if (!signature) {
//         finalSignature = await signTypedDataAsync({
//           domain: REGISTER_DOMAIN,
//           types: REGISTER_TYPES,
//           primaryType: "Register",
//           message: {
//             display_name: displayName,
//           },
//         });
//         setSignature(finalSignature);
//         localStorage.setItem(`${SIGNATURE_KEY}_${address}`, finalSignature);
//       }

//       const response = await usersApi.register(displayName);

//       if (response) {
//         setUserInLS(response);
//         setUser(response);
//         localStorage.setItem(USER_ADDRESS_KEY, address!);
//         setNeedsSignUp(false);

//         localStorage.removeItem(`${NEEDS_SIGNUP_KEY}_${address}`);
//         localStorage.removeItem(`${SIGNATURE_KEY}_${address}`);
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     const currentAddress = address;
//     localStorage.removeItem("user");
//     localStorage.removeItem(USER_ADDRESS_KEY);
//     if (currentAddress) {
//       localStorage.removeItem(`${SIGNATURE_KEY}_${currentAddress}`);
//       localStorage.removeItem(`${NEEDS_SIGNUP_KEY}_${currentAddress}`);
//     }
//     setUser(null);
//     setSignature(null);
//     setNeedsSignUp(false);
//   };

//   const value = {
//     user,
//     setUser,
//     isLoading,
//     signUp,
//     logout,
//     checkUserExists,
//     signature,
//     setSignature,
//     needsSignUp,
//     setNeedsSignUp,
//     handleAddressChange,
//   };

//   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
// }

// export function useUser() {
//   const context = useContext(UserContext);
//   if (context === undefined) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// }
