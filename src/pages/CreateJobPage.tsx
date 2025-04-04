
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { createJob } = useJobs();
  const { currentUser } = useAuth();
  const { jobCategories, skillsList } = useData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    skills: [] as string[],
  });

  const handleAddSkill = (skill: string) => {
    if (formData.skills.includes(skill)) return;
    setFormData({
      ...formData,
      skills: [...formData.skills, skill]
    });
  };
  
  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para publicar una propuesta"
      });
      return;
    }
    
    if (!formData.title || !formData.description || !formData.budget || !formData.category) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos"
      });
      return;
    }
    
    if (formData.skills.length === 0) {
      toast({
        variant: "destructive",
        title: "Habilidades requeridas",
        description: "Debes seleccionar al menos una habilidad"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createJob({
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        category: formData.category,
        skills: formData.skills,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photoURL,
        status: 'open'
      });
      
      toast({
        title: "Propuesta publicada",
        description: "Tu propuesta ha sido publicada con éxito"
      });
      
      navigate('/jobs');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo publicar la propuesta"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Publicar nueva propuesta</h1>
          <p className="text-gray-600 mt-1">
            Completa el formulario para publicar tu propuesta de trabajo.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la propuesta</CardTitle>
            <CardDescription>
              Proporciona información detallada para atraer a los mejores profesionales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la propuesta *</Label>
                <Input 
                  id="title"
                  placeholder="Ej: Diseño de logo para empresa de tecnología"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción detallada *</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe tu proyecto, requisitos, plazos, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[150px]"
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget">Presupuesto (USD) *</Label>
                  <Input 
                    id="budget"
                    type="number"
                    placeholder="Ej: 500"
                    min="1"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {jobCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Habilidades requeridas *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} className="bg-wfc-purple-medium text-white hover:bg-wfc-purple-medium">
                      {skill}
                      <button 
                        type="button"
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
                      .filter(skill => !formData.skills.includes(skill))
                      .map((skill, index) => (
                      <option key={index} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/jobs')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-wfc-purple hover:bg-wfc-purple-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publicando..." : "Publicar propuesta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateJobPage;
