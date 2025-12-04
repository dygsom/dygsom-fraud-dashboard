'use client';

/**
 * Login Page
 *
 * User authentication page with email/password login
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DygsomBrand } from '@/components/ui/dygsom-logo';
import { logger } from '@/lib/logger';
import { isValidEmail } from '@/lib/utils/validation';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Check for session expiration message
  useEffect(() => {
    const authMessage = sessionStorage.getItem('auth_message');
    if (authMessage) {
      setInfoMessage(authMessage);
      sessionStorage.removeItem('auth_message');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Por favor, completa todos los campos para continuar');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Por favor, ingresa una dirección de correo válida');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (err: any) {
      logger.error('Login error', err);
      
      // User-friendly error messages
      let userMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      
      if (err?.status_code === 401) {
        userMessage = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      } else if (err?.status_code === 429) {
        userMessage = 'Demasiados intentos de login. Espera unos minutos antes de intentar nuevamente.';
      } else if (err?.status_code >= 500) {
        userMessage = 'Servicio temporalmente no disponible. Inténtalo de nuevo en unos minutos.';
      } else if (!err?.status_code) {
        userMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
      }
      
      setError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* DYGSOM Branding Header */}
        <div className="text-center mb-8">
          <DygsomBrand 
            logoSize="xl"
            showTagline={false}
            orientation="vertical"
            className="mb-4"
          />
          <p className="text-slate-600 text-lg">Plataforma antifraude para e-commerce y fintech</p>
        </div>

        <Card className="dygsom-card">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-slate-600">
              Accede a tu panel de control de detección de fraude
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {infoMessage && (
              <div className="rounded-md bg-blue-50 p-3 mb-3">
                <p className="text-sm text-blue-800">{infoMessage}</p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          © 2025 DYGSOM • Hecho con ❤️ para la seguridad financiera en Latinoamérica
        </div>
      </div>
    </div>
  );
}
