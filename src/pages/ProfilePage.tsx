
import { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { X, Camera } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';
import { Link } from 'react-router-dom';
import { JobType } from '@/contexts/JobContext';

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { skillsList } = useData();
  const { jobs, getSavedJobs } = useJobs();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [userJobs, setUserJobs] = useState<JobType[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobType[]>([]);
  
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    skills: currentUser?.skills || [],
  });

  useEffect(() => {
    // When jobs data is loaded, filter user jobs
    if (Array.isArray(jobs)) {
      setUserJobs(jobs.filter(job => job.userId === currentUser?.id));
    }
    
    // Load saved jobs
    const loadSavedJobs = async () => {
      if (currentUser) {
        const saved = await getSavedJobs(currentUser.id);
        if (Array.isArray(saved)) {
          setSavedJobs(saved);
        }
      }
    };
    
    loadSavedJobs();
  }, [jobs, currentUser, getSavedJobs]);
  
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    setIsUpdating(true);
    try {
      // Simulamos la carga de la imagen de perfil
      let photoURL = currentUser.photoURL;
      
      if (selectedImage) {
        // En un caso real, aquí subiríamos la imagen a un servicio de almacenamiento
        // y obtendríamos la URL de la imagen
        photoURL = URL.createObjectURL(selectedImage);
      }
      
      await updateUserProfile({
        name: profileForm.name,
        bio: profileForm.bio,
        skills: profileForm.skills,
        photoURL
      });
      
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddSkill = (skill: string) => {
    if (profileForm.skills.includes(skill)) return;
    setProfileForm({
      ...profileForm,
      skills: [...profileForm.skills, skill]
    });
  };
  
  const handleRemoveSkill = (skill: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter(s => s !== skill)
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      toast({
        title: "Imagen seleccionada",
        description: "Haz clic en 'Guardar cambios' para confirmar"
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            <TabsTrigger value="proposals">Mis Propuestas</TabsTrigger>
            <TabsTrigger value="saved">Guardadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Información básica */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de perfil</CardTitle>
                    <CardDescription>
                      Actualiza tu información para que los clientes te conozcan mejor.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        value={currentUser.email}
                        disabled
                      />
                      <p className="text-sm text-gray-500">
                        No se puede cambiar el correo electrónico
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos sobre ti, tu experiencia y las áreas en las que trabajas"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Habilidades</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profileForm.skills.map((skill, index) => (
                          <Badge key={index} className="bg-wfc-purple-medium text-white hover:bg-wfc-purple-medium">
                            {skill}
                            <button 
                              className="ml-1 hover:bg-wfc-purple rounded-full" 
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddSkill(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Seleccionar habilidad</option>
                          {skillsList
                            .filter(skill => !profileForm.skills.includes(skill))
                            .map((skill, index) => (
                            <option key={index} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full md:w-auto bg-wfc-purple hover:bg-wfc-purple-medium"
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Foto de perfil y estadísticas */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Foto de perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4 relative group">
                      <AvatarImage 
                        src={selectedImage ? URL.createObjectURL(selectedImage) : currentUser.photoURL} 
                        alt={currentUser.name} 
                      />
                      <AvatarFallback className="bg-wfc-purple-medium text-white text-2xl">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                      
                      <label htmlFor="profile-photo" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white h-10 w-10" />
                      </label>
                    </Avatar>
                    
                    <input
                      type="file"
                      id="profile-photo"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    
                    <Label htmlFor="profile-photo" className="cursor-pointer">
                      <Button variant="outline" className="w-full" type="button">
                        Cambiar foto
                      </Button>
                    </Label>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Imagen PNG, JPG o GIF, máximo 2MB
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Propuestas publicadas</span>
                        <span className="font-medium">{userJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Propuestas guardadas</span>
                        <span className="font-medium">{savedJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calificación</span>
                        <span className="font-medium">5.0 ⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Miembro desde</span>
                        <span className="font-medium">Apr 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="proposals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Propuestas</CardTitle>
                <CardDescription>
                  Propuestas de trabajo que has publicado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Aún no has publicado ninguna propuesta</p>
                    <Button 
                      className="mt-4 bg-wfc-purple hover:bg-wfc-purple-medium"
                      onClick={() => window.location.href = '/create-job'}
                    >
                      Crear nueva propuesta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:border-wfc-purple cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/jobs/${job.id}`}
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-medium">{job.title}</h3>
                            <p className="text-sm text-gray-500">
                              Publicado el {formatDate(job.timestamp)} • {job.comments.length} comentarios
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge className={`
                              ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                                job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}
                            `}>
                              {job.status === 'open' ? 'Abierto' : 
                                job.status === 'in-progress' ? 'En progreso' : 
                                'Completado'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Propuestas Guardadas</CardTitle>
                <CardDescription>
                  Propuestas de trabajo que has guardado para revisar más tarde
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Aún no has guardado ninguna propuesta</p>
                    <Button 
                      className="mt-4 bg-wfc-purple hover:bg-wfc-purple-medium"
                      onClick={() => window.location.href = '/jobs'}
                    >
                      Explorar propuestas
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <Link key={job.id} to={`/jobs/${job.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-wfc-purple cursor-pointer transition-colors">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <h3 className="font-medium">{job.title}</h3>
                              <p className="text-sm text-gray-500">
                                {job.userName} • {formatDate(job.timestamp)}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center">
                              <Badge className="bg-purple-100 text-purple-800 mr-2">
                                {job.category}
                              </Badge>
                              <Badge className={`
                                ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                                  job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'}
                              `}>
                                {job.status === 'open' ? 'Abierto' : 
                                  job.status === 'in-progress' ? 'En progreso' : 
                                  'Completado'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {job.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
