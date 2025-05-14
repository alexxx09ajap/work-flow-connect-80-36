
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import EmojiPickerLib from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiClick }) => {
  const [open, setOpen] = useState(false);
  
  const handleEmojiSelect = (emojiData: any) => {
    onEmojiClick(emojiData.emoji);
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-9 w-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <SmilePlus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-0" align="end">
        <div className="emoji-picker-container">
          <EmojiPickerLib
            onEmojiClick={handleEmojiSelect}
            width="100%"
            height="350px"
            lazyLoadEmojis={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
