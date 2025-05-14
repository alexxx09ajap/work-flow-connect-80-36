
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Solo redirigir si el usuario inició sesión y vino desde otra página o si inicia sesión manualmente
  useEffect(() => {
    // Obtener estado de redirección (si existe)
    const from = location.state?.from;
    
    if (isAuthenticated && from) {
      // Si está autenticado y vino de otra página, redirigir de vuelta
      navigate(from.pathname || '/dashboard');
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      // Después de un inicio de sesión exitoso, redirigimos al dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-md bg-wfc-purple flex items-center justify-center">
              <span className="text-white font-bold text-xl">WFC</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">WorkFlow Connect</h1>
          <p className="text-gray-500 mt-2">La plataforma que conecta proyectos con talento</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link to="#" className="text-sm text-wfc-purple hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button
                className="w-full bg-wfc-purple hover:bg-wfc-purple-medium"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
              
              <p className="mt-4 text-center text-sm">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-wfc-purple hover:underline">
                  Regístrate
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
