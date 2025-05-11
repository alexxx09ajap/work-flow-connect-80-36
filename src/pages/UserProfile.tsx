
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { UserType } from '@/types';
import MainLayout from '@/components/Layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Verified } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getUserById } = useData();
  const { currentUser } = useAuth();
  const { createPrivateChat } = useChat();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfileUser = async () => {
      setIsLoading(true);
      if (userId) {
        const user = getUserById(userId);
        setProfileUser(user || null);
      }
      setIsLoading(false);
    };
    
    fetchProfileUser();
  }, [userId, getUserById]);
  
  // Update the contact function to use createPrivateChat
  const handleContactUser = async () => {
    if (profileUser && createPrivateChat) {
      await createPrivateChat(profileUser.id);
      navigate('/chats');
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (!profileUser) {
    return (
      <MainLayout>
        <div className="container-custom">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-4">
              <p className="text-center text-gray-500">
                Usuario no encontrado
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container-custom">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileUser.photoURL} alt={profileUser.name} />
                <AvatarFallback className="bg-wfc-purple-medium text-white">
                  {profileUser.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold flex items-center">
                {profileUser.name}
                {profileUser.isVerified && (
                  <Verified className="ml-1 h-4 w-4 text-blue-500" />
                )}
              </h2>
              <p className="text-gray-500">{profileUser.email}</p>
              {currentUser && profileUser.id !== currentUser.id && (
                <Button onClick={handleContactUser} className="bg-wfc-purple hover:bg-wfc-purple-medium">
                  Contactar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
