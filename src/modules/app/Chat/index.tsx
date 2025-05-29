"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

import ChatInfo from "@/modules/app/Views/ChatInfo";
import { useViewStore } from "@/store/viewStore";

import ChatHeader from "./components/ChatHeader";
import ChatView from "./components/ChatView";

const Chat = () => {
  const params = useParams();
  const id = params?.id as string;
  const { setSelectedChatId, isChatInfoOpen } = useViewStore();

  useEffect(() => {
    setSelectedChatId(id);
  }, [id, setSelectedChatId]);

  return (
    <motion.div
      className="grid h-full grid-cols-[1fr_auto] overflow-hidden min-w-0"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
    >
      <div className="flex flex-col h-full min-w-0 overflow-hidden">
        <ChatHeader chatId={id} />
        <ChatView chatId={id} />
      </div>

      <AnimatePresence>
        {isChatInfoOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/20 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className="w-[320px] h-full z-20 relative"
            >
              <ChatInfo />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Chat;
