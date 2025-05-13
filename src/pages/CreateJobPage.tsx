
import React, { useState } from 'react';
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the form validation schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  category: z.string().min(1, {
    message: "Debes seleccionar una categoría.",
  }),
  budget: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El presupuesto debe ser un número mayor que 0.",
  })
});

const CreateJobPage = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { jobCategories, skillsList } = useData();
  const { createJob } = useJobs();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budget: ""
    },
  });

  const handleAddSkill = () => {
    if (currentSkill && !selectedSkills.includes(currentSkill)) {
      setSelectedSkills([...selectedSkills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
        title: values.title,
        description: values.description,
        budget: Number(values.budget),
        category: values.category,
        skills: selectedSkills,
        userId: currentUser.id,
        status: 'open'
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
            <h1 className="text-2xl font-semibold mb-6 dark:text-white">Crear una nueva propuesta</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-1 block dark:text-gray-200">Título de la propuesta*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Diseño de logo para empresa de tecnología"
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-1 block dark:text-gray-200">Descripción*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe detalladamente lo que necesitas..."
                          rows={5}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-1 block dark:text-gray-200">Categoría*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          {jobCategories.map((cat) => (
                            <SelectItem key={cat} value={cat} className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Label htmlFor="skills" className="mb-1 block dark:text-gray-200">Habilidades requeridas</Label>
                  <div className="flex space-x-2 mb-2">
                    <Select value={currentSkill} onValueChange={setCurrentSkill}>
                      <SelectTrigger className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <SelectValue placeholder="Selecciona las habilidades necesarias" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {skillsList
                          .filter(skill => !selectedSkills.includes(skill))
                          .map((skill) => (
                            <SelectItem key={skill} value={skill} className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">
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
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                    >
                      Agregar
                    </Button>
                  </div>
                  
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="flex items-center space-x-1 dark:bg-gray-700 dark:text-white">
                          <span>{skill}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-1 block dark:text-gray-200">Presupuesto (USD)*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ingresa el presupuesto"
                          min={1}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/jobs')}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
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
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateJobPage;
