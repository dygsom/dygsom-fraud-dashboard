'use client';

/**
 * Login Page
 *
 * User authentication page with email/password login
 * Enhanced with improved UI/UX, better error handling, and visual feedback
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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for session expiration message
  useEffect(() => {
    const authMessage = sessionStorage.getItem('auth_message');
    if (authMessage) {
      setInfoMessage(authMessage);
      sessionStorage.removeItem('auth_message');
    }
  }, []);

  // Real-time email validation
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Ingresa una dirección de correo válida');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Real-time password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Comprehensive validation
    const isEmailValid = validateEmail(email.trim());
    const isPasswordValid = validatePassword(password);
    
    if (!email.trim()) {
      setEmailError('El correo electrónico es requerido');
      return;
    }
    
    if (!password) {
      setPasswordError('La contraseña es requerida');
      return;
    }

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsLoading(true);
      setShowSuccessMessage(true);
      
      // Debug logging
      console.log('DEBUG - About to login with:', {
        email: email.trim(),
        emailLength: email.trim().length,
        passwordLength: password.length
      });
      
      await login(email.trim(), password);
    } catch (err: any) {
      logger.error('Login error', err);
      setShowSuccessMessage(false);
      
      // Enhanced user-friendly error messages
      let userMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      
      if (err?.status_code === 401) {
        userMessage = '🔐 Email o contraseña incorrectos. Por favor, verifica tus credenciales e inténtalo nuevamente.';
      } else if (err?.status_code === 429) {
        userMessage = '⏳ Demasiados intentos de acceso. Por seguridad, espera unos minutos antes de intentar nuevamente.';
      } else if (err?.status_code >= 500) {
        userMessage = '🔧 Servicio temporalmente no disponible. Nuestro equipo está trabajando en solucionarlo. Inténtalo de nuevo en unos minutos.';
      } else if (!err?.status_code) {
        userMessage = '🌐 Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
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

        <Card className="dygsom-card shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Iniciar Sesión</CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Accede a tu panel de control de detección de fraude
            </CardDescription>
          </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Correo Electrónico *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@dygsom.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value) validateEmail(e.target.value.trim());
                }}
                onBlur={(e) => validateEmail(e.target.value.trim())}
                disabled={isLoading}
                autoComplete="email"
                error={emailError}
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Contraseña *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) validatePassword(e.target.value);
                }}
                onBlur={(e) => validatePassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                showPasswordToggle
                error={passwordError}
                className="text-base"
              />
            </div>

            {infoMessage && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-blue-800">{infoMessage}</p>
                </div>
              </div>
            )}

            {showSuccessMessage && isLoading && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">✅ Verificando credenciales...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg" 
              isLoading={isLoading}
              disabled={isLoading || !!emailError || !!passwordError}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center text-sm pt-4">
              <span className="text-gray-600">¿No tienes una cuenta? </span>
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Crear cuenta
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
