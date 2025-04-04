
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useJobs } from '@/contexts/JobContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

const JobsPage = () => {
  const { jobs, loading } = useJobs();
  const { jobCategories } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Filtrar propuestas según los criterios
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold">Propuestas de trabajo</h1>
            <p className="text-gray-600 mt-1">Encuentra oportunidades que se ajusten a tu perfil</p>
          </div>
          <Link to="/create-job">
            <Button className="bg-wfc-purple hover:bg-wfc-purple-medium">
              <Plus className="h-4 w-4 mr-2" /> Nueva propuesta
            </Button>
          </Link>
        </div>
        
        {/* Filtros */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar propuestas..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {jobCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="open">Abiertos</SelectItem>
                <SelectItem value="in-progress">En progreso</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Resultados */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Cargando propuestas...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron propuestas que coincidan con los filtros</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="hover:border-wfc-purple transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription>
                            Publicado por {job.userName} • {formatDate(job.timestamp)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`
                            ${job.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                              job.status === 'in-progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                              'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                          `}>
                            {job.status === 'open' ? 'Abierto' : 
                             job.status === 'in-progress' ? 'En progreso' : 
                             'Completado'}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                            {job.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-gray-50">
                          ${job.budget}
                        </Badge>
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{job.skills.length - 3} más
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">{job.comments.length} comentarios</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-wfc-purple">
                          Ver detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobsPage;
