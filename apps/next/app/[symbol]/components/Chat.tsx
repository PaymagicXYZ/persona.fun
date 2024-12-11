// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { useEffect, useRef, useState } from "react";
// import { format } from "date-fns";
// import { getUserFromLS } from "@/lib/localStorage";
// import SignUpModal from "./SignUpModal";
// import useGetMessagesQuery, { useChatSubscription } from "@/hooks/use-chat";
// import { chatApi } from "@/lib/api/chat";
// import { Label } from "@/components/ui/label";
// import { useUser } from "@/context/user";

// export default function Chat({ fid }: { fid: number }) {
//   const { user } = useUser();

//   return (
//     <Card className="w-full h-[600px] flex flex-col bg-[#121212]">
//       <CardContent className="h-full p-0 flex flex-col">
//         <div className="flex-1 min-h-0">
//           {" "}
//           <ScrollArea className="h-full">
//             <ChatMessages fid={fid} />
//           </ScrollArea>
//         </div>
//         <div className="mt-auto">
//           {" "}
//           {/* {!user && <SignUpModal />} */}
//           {user && <ChatInput fid={fid} />}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function ChatInput({ fid }: { fid: number }) {
//   const [message, setMessage] = useState("");

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     const response = await chatApi.sendMessage({
//       message: message.trim(),
//       personaId: fid,
//     });
//     console.log(response);
//     setMessage("");
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <div className="p-4 border-t border-gray-800 flex gap-2 bg-[#121212]">
//       <Input
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={handleKeyPress}
//         placeholder="Type a message..."
//         className="flex-1 bg-transparent border-gray-700 text-white"
//       />
//       <Button
//         variant="secondary"
//         disabled={!message.trim()}
//         onClick={sendMessage}
//       >
//         Send
//       </Button>
//     </div>
//   );
// }

// const ChatMessages = ({ fid }: { fid: number }) => {
//   const { messages } = useGetMessagesQuery({ fid });
//   useChatSubscription({ fid });
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   return (
//     <div className="flex flex-col space-y-6 p-4">
//       {messages?.map((message) => (
//         <div key={message.id} className="flex gap-3">
//           <Avatar className="h-8 w-8">
//             {" "}
//             <AvatarFallback
//               style={{
//                 background:
//                   message.background_gradient ||
//                   "linear-gradient(45deg, #e2e8f0, #cbd5e1)",
//               }}
//               className="text-white text-xs"
//             >
//               {message.display_name?.[0].toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <div className="flex-1">
//             <div className="flex items-center gap-2">
//               <Label className="font-medium text-white text-sm">
//                 {message.display_name}
//               </Label>
//               <Label className="text-xs text-gray-500">
//                 {format(new Date(message.created_at), "HH:mm")}
//               </Label>
//             </div>
//             <Label className="text-sm text-gray-300 mt-0.5">
//               {message.message}
//             </Label>
//           </div>
//         </div>
//       ))}
//       <div ref={scrollRef} />
//     </div>
//   );
// };
