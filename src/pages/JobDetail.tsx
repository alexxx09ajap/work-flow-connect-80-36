
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send, MessageCircle } from 'lucide-react';

const JobDetail = () => {
  const { jobId } = useParams();
  const { getJobById } = useJobs();
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const chat = useChat();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");

  const job = getJobById(jobId || "");
  const user = job ? getUserById(job.userId) : null;

  if (!job) {
    return (
      <MainLayout>
        <div>Job not found</div>
      </MainLayout>
    );
  }

  const handleContactFreelancer = async () => {
    if (user) {
      await chat.createPrivateChat(user.id);
      navigate('/chats');
    }
  };

  const handleSubmitComment = () => {
    // Logic to submit comment
  };

  return (
    <MainLayout>
      <div className="container-custom">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <div className="mt-2 flex items-center space-x-2">
                {job.skills &&
                  job.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Descripción</h2>
              <p>{job.description}</p>
            </div>

            <Separator className="my-4" />

            <div>
              <h2 className="text-xl font-semibold mb-2">Detalles del Freelancer</h2>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <Button onClick={handleContactFreelancer} size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contactar
                    </Button>
                  </div>
                </div>
              ) : (
                <p>Freelancer information not available.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center p-6">
            <div>
              <h3 className="text-lg font-semibold">Comentarios</h3>
              <Textarea
                placeholder="Escribe tu comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mt-2"
              />
              <Button onClick={handleSubmitComment} className="mt-2">
                Enviar <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
