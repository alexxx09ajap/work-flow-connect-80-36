
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateJobPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { jobCategories, skillsList } = useData();
  const { createJob } = useJobs();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddSkill = () => {
    if (currentSkill && !selectedSkills.includes(currentSkill)) {
      setSelectedSkills([...selectedSkills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !budget) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios."
      });
      return;
    }

    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear una propuesta."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the job using the JobContext's createJob function
      await createJob({
        title,
        description,
        budget: Number(budget),
        category,
        skills: selectedSkills,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photoURL,
        status: 'open'
      });

      toast({
        title: "Éxito",
        description: "La propuesta se ha creado correctamente."
      });

      // Redirect to the jobs page
      navigate('/jobs');
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear la propuesta. Inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold mb-6">Crear una nueva propuesta</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-1 block">Título de la propuesta*</Label>
                <Input
                  type="text"
                  id="title"
                  placeholder="Ej: Diseño de logo para empresa de tecnología"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="mb-1 block">Descripción*</Label>
                <Textarea
                  id="description"
                  placeholder="Describe detalladamente lo que necesitas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="mb-1 block">Categoría*</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="skills" className="mb-1 block">Habilidades requeridas</Label>
                <div className="flex space-x-2 mb-2">
                  <Select value={currentSkill} onValueChange={setCurrentSkill}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecciona las habilidades necesarias" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillsList
                        .filter(skill => !selectedSkills.includes(skill))
                        .map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={handleAddSkill}
                    disabled={!currentSkill}
                    variant="outline"
                  >
                    Agregar
                  </Button>
                </div>
                
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedSkills.map(skill => (
                      <Badge key={skill} variant="outline" className="flex items-center space-x-1">
                        <span>{skill}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="budget" className="mb-1 block">Presupuesto (USD)*</Label>
                <Input
                  type="number"
                  id="budget"
                  placeholder="Ingresa el presupuesto"
                  min={1}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/jobs')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-wfc-purple hover:bg-wfc-purple-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear propuesta'}
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
