
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { UserType } from '@/contexts/DataContext';

interface UserSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onUserSelect?: (userId: string) => void;
  excludeUsers?: string[];
}

export const UserSelectDialog = ({
  open,
  onOpenChange,
  title = "Seleccionar usuario",
  onUserSelect,
  excludeUsers = []
}: UserSelectDialogProps) => {
  const { getAllUsers } = useData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const allUsers = getAllUsers();
  
  // Filter users: exclude current user, exclude specified users, and filter by name
  const filteredUsers = allUsers.filter(user => 
    user.id !== currentUser?.id && 
    !excludeUsers.includes(user.id) &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectUser = (user: UserType) => {
    if (onUserSelect) {
      onUserSelect(user.id);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <ScrollArea className="h-[300px]">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron usuarios
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md"
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar>
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
