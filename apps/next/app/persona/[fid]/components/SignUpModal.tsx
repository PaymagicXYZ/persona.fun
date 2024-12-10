// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useDebounce } from "use-debounce";
// import { Label } from "@/components/ui/label";
// import { useUser } from "@/context/user";
// import { Loader2 } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { usersApi } from "@/lib/api/users";

// export default function SignUpModal() {
//   const { signUp, needsSignUp, signature } = useUser();
//   const [displayName, setDisplayName] = useState("");
//   const [isSigningUp, setIsSigningUp] = useState(false);
//   const [debouncedDisplayName] = useDebounce(displayName.trim(), 500);

//   const { data: existingUser, isFetching } = useQuery({
//     queryKey: ["user", debouncedDisplayName],
//     queryFn: () => usersApi.get(debouncedDisplayName),
//     enabled: !!debouncedDisplayName && debouncedDisplayName.length >= 3,
//     retry: false,
//   });

//   const handleSignUp = async () => {
//     try {
//       setIsSigningUp(true);
//       // Use the stored signature from verification
//       await signUp(displayName.trim());
//     } catch (error) {
//       console.error("Error signing up:", error);
//     } finally {
//       setIsSigningUp(false);
//     }
//   };

//   return (
//     <Dialog
//       open={needsSignUp}
//       onOpenChange={(open) => {
//         if (needsSignUp && !open) return; // Prevent closing if signup needed
//       }}
//     >
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Complete Sign Up</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Input
//               placeholder="Display Name"
//               value={displayName}
//               onChange={(e) => setDisplayName(e.target.value)}
//               className={existingUser?.id ? "border-red-500" : ""}
//               disabled={isSigningUp}
//             />
//             {debouncedDisplayName && (
//               <Label
//                 className={existingUser?.id ? "text-red-500" : "text-green-500"}
//               >
//                 {existingUser?.id ? "Username taken" : "Username available"}
//               </Label>
//             )}
//           </div>
//           <Button
//             disabled={
//               !displayName.trim() || Boolean(existingUser?.id) || isSigningUp
//             }
//             onClick={handleSignUp}
//           >
//             {isSigningUp ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating Account...
//               </>
//             ) : (
//               "Complete Sign Up"
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
