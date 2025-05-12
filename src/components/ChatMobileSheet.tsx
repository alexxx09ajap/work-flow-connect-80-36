
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, Users, UserPlus } from "lucide-react";
import { ChatType } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ChatMobileSheet = ({
  isOpen,
  onClose,
  title,
  children
}: ChatMobileSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="sm:max-w-md w-full p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <SheetTitle>{title}</SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] p-4">
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMobileSheet;
