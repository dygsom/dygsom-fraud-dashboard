/**
 * Root Layout
 *
 * Main layout wrapper for the entire application
 */

import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'DYGSOM - Plataforma Antifraude',
  description: 'IA antifraude diseñada para Latinoamérica. Reduce pérdidas por fraude y chargebacks en tus pagos online, sin frenar las ventas de tus clientes legítimos.',
  keywords: 'antifraude, detección fraude, e-commerce, fintech, IA, machine learning, Latinoamérica',
  authors: [{ name: 'DYGSOM', url: 'https://www.dygsom.pe/' }],
  creator: 'DYGSOM',
  publisher: 'DYGSOM',
  icons: {
    icon: '/dygsom-logo.svg',
    shortcut: '/dygsom-logo.svg',
    apple: '/dygsom-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
