
      {/* Mobile chat view with emoji support */}
      {activeChat && (
        <ChatMobileSheet
          isOpen={isMobileChat}
          onClose={() => setIsMobileChat(false)}
          title={getChatName(activeChat)}
          messages={activeMessages}
          isGroup={activeChat.isGroup}
          onEditMessage={(id, content) => setEditingMessage({ id, content })}
          onDeleteMessage={(id) => setIsConfirmingDelete(id)}
          onLeaveGroup={activeChat.isGroup ? () => setIsConfirmingLeave(true) : undefined}
        >
          <div className="flex items-center space-x-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
            <Input
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-[#9b87f5] hover:bg-[#8a74f0]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </ChatMobileSheet>
      )}
