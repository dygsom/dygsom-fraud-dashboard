'use client';

/**
 * DYGSOM Sidebar Component
 *
 * Navigation sidebar with DYGSOM design and fraud detection focus
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DygsomLogo } from '@/components/ui/dygsom-logo';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const navigation: NavItem[] = [
  { 
    name: 'Panel Principal', 
    href: ROUTES.protected.dashboard, 
    description: 'Vista general del sistema',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    name: 'Transacciones', 
    href: ROUTES.protected.transactions, 
    description: 'Monitoreo y análisis',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  { 
    name: 'Claves API', 
    href: ROUTES.protected.apiKeys, 
    description: 'Gestión de accesos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    )
  },
  { 
    name: 'Analítica', 
    href: ROUTES.protected.analytics, 
    description: 'Reportes y métricas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 dygsom-card border-r border-blue-100/60 border-t-0 border-l-0 border-b-0 rounded-none">
      <div className="p-6">
        {/* DYGSOM Logo */}
        <div className="mb-8">
          <DygsomLogo size="lg" className="mb-2" />
        </div>
        
        {/* Navigation Title */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Detección de Fraude
          </h2>
          <div className="w-8 h-0.5 dygsom-gradient-primary rounded-full"></div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  'hover:shadow-sm',
                  isActive
                    ? 'dygsom-gradient-primary text-white shadow-lg'
                    : 'text-slate-700 hover:bg-blue-50/70 hover:text-blue-700'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                )}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    'text-xs truncate',
                    isActive
                      ? 'text-blue-100'
                      : 'text-slate-500 group-hover:text-blue-600'
                  )}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Info Section */}
        <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Sistema Operativo</div>
              <div className="text-xs text-slate-600">IA funcionando correctamente</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Protegiendo transacciones en tiempo real
          </div>
        </div>
      </div>
    </aside>
  );
}
