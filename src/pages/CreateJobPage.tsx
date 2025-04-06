import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const CreateJobPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const { toast } = useToast();
  const { jobCategories } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !budget) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos."
      });
      return;
    }

    // Aquí puedes agregar la lógica para enviar los datos del trabajo a tu backend o contexto
    console.log({ title, description, category, budget });

    toast({
      title: "Éxito",
      description: "El trabajo se ha creado correctamente."
    });

    // Redirigir al usuario a la página de trabajos o a donde sea necesario
    navigate('/jobs');
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold mb-6">Crear un nuevo trabajo</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título del trabajo</Label>
                <Input
                  type="text"
                  id="title"
                  placeholder="Ej: Diseño de logo para empresa de tecnología"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción del trabajo</Label>
                <Textarea
                  id="description"
                  placeholder="Describe los detalles del trabajo que necesitas realizar."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="budget">Presupuesto (USD)</Label>
                <Input
                  type="number"
                  id="budget"
                  placeholder="Ej: 500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-wfc-purple hover:bg-wfc-purple-medium">
                Crear trabajo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateJobPage;
