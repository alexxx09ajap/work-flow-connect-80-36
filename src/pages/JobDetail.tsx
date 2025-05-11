import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useData } from '@/contexts/DataContext';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const JobDetail = () => {
  const { jobId } = useParams();
  const { getJobById } = useJob();
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const chat = useChat();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      
      setLoading(true);
      
      try {
        const jobData = await getJobById(jobId);
        
        if (jobData) {
          setJob(jobData);
          
          const ownerData = await getUserById(jobData.userId);
          setOwner(ownerData);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se encontró la propuesta"
          });
          navigate('/jobs');
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la propuesta"
        });
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [jobId, getJobById, getUserById, navigate]);
  
  // Update the contact function to use createPrivateChat
  const handleContactOwner = async () => {
    if (job && chat.createPrivateChat) {
      await chat.createPrivateChat(job.userId);
      navigate('/chats');
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p className="mt-2">Cargando detalles de la propuesta...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!job) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold">Propuesta no encontrada</h2>
          <p className="mt-2">La propuesta que estás buscando no existe o ha sido eliminada.</p>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            Volver a la lista de propuestas
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
            <CardDescription>
              {owner ? (
                <div className="flex items-center mt-2">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarImage src={owner.photoURL} alt={owner.name} />
                    <AvatarFallback>{owner.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>
                    Publicado por {owner.name}
                  </span>
                </div>
              ) : (
                <span>Publicado por un usuario desconocido</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Descripción</h3>
              <p>{job.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Categoría</h3>
              <Badge variant="secondary">{job.category}</Badge>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Habilidades requeridas</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
            <div className="text-xl font-semibold">
              Presupuesto: ${job.budget}
            </div>
            <div className="flex justify-end space-x-2">
              {currentUser && job.userId !== currentUser.id && (
                <Button onClick={handleContactOwner} className="bg-wfc-purple hover:bg-wfc-purple-medium text-white">
                  Contactar
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
