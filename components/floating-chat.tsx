"use client";

import { MessageCircle, Minimize2, X } from "lucide-react";
import { useState } from "react";
import { Chat } from "@/components/chat/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { cn, generateUUID } from "@/lib/utils";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatId = generateUUID();

  return (
    <>
      {/* Floating Button */}
      <button
        className={cn(
          "fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl",
          isOpen && "hidden"
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Sheet */}
      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent
          className="flex h-full w-full flex-col p-0 sm:max-w-2xl"
          side="right"
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <SheetHeader>
                <SheetTitle>Travel Assistant</SheetTitle>
                <SheetDescription>
                  Ask questions about your travel documents
                </SheetDescription>
              </SheetHeader>
              <div className="flex gap-2">
                <button
                  className="rounded-lg p-2 hover:bg-muted"
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                  }}
                  type="button"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg p-2 hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div
              className={cn(
                "flex-1 overflow-hidden transition-all",
                isMinimized && "hidden"
              )}
            >
              <Chat
                autoResume={false}
                id={chatId}
                initialChatModel={DEFAULT_CHAT_MODEL}
                initialMessages={[]}
                initialVisibilityType="private"
                isReadonly={false}
                key={chatId}
              />
              <DataStreamHandler />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
