
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/components/ui/use-toast';
import { UserType } from '@/types';

export const UserChatSelect = () => {
  const { getAllUsers } = useData();
  const { createPrivateChat, findExistingPrivateChat } = useChat();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  
  useEffect(() => {
    // Load all available users
    const allUsers = getAllUsers();
    console.log("Available users for private chat:", allUsers);
    setUsers(allUsers);
  }, [getAllUsers]);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleStartChat = async (userId: string) => {
    try {
      // Check if chat already exists
      const existingChat = findExistingPrivateChat(userId);
      
      if (existingChat) {
        toast({
          title: "Chat ya existe",
          description: "Ya tienes un chat con este usuario"
        });
        return;
      }
      
      // Create new chat
      const newChat = await createPrivateChat(userId);
      
      if (newChat) {
        toast({
          title: "Chat iniciado",
          description: "Se ha iniciado un nuevo chat"
        });
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat"
      });
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <ScrollArea className="h-[400px]">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No se encontraron usuarios
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-wfc-purple hover:text-wfc-purple-medium hover:bg-wfc-purple/10"
                  onClick={() => handleStartChat(user.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
