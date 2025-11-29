/**
 * DYGSOM Brand Theme Configuration
 * 
 * Colors, typography and design tokens extracted from https://www.dygsom.pe/
 * Maintains brand consistency across the fraud dashboard platform.
 */

export const dygsomTheme = {
  // Primary brand colors from DYGSOM identity
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe', // Light gradient start
      200: '#bae6fd', // Light gradient end
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary DYGSOM blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Supporting colors for fraud detection context
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    
    // Neutral grays for professional look
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  },
  
  // Typography for professional fintech appearance
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    }
  },
  
  // Shadows and effects for depth
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // Border radius for consistent rounded corners
  borderRadius: {
    sm: '0.25rem',
    base: '0.375rem', 
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  // Animation durations
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  }
} as const;

// CSS Variables for runtime theme switching
export const dygsomCSSVars = `
:root {
  /* Primary Brand Colors */
  --dygsom-primary-50: #f0f9ff;
  --dygsom-primary-100: #e0f2fe;
  --dygsom-primary-200: #bae6fd;
  --dygsom-primary-300: #7dd3fc;
  --dygsom-primary-400: #38bdf8;
  --dygsom-primary-500: #0ea5e9;
  --dygsom-primary-600: #0284c7;
  --dygsom-primary-700: #0369a1;
  --dygsom-primary-800: #075985;
  --dygsom-primary-900: #0c4a6e;
  
  /* Status Colors */
  --dygsom-success: #22c55e;
  --dygsom-warning: #f59e0b;
  --dygsom-danger: #ef4444;
  
  /* Gray Scale */
  --dygsom-gray-50: #f8fafc;
  --dygsom-gray-100: #f1f5f9;
  --dygsom-gray-200: #e2e8f0;
  --dygsom-gray-300: #cbd5e1;
  --dygsom-gray-400: #94a3b8;
  --dygsom-gray-500: #64748b;
  --dygsom-gray-600: #475569;
  --dygsom-gray-700: #334155;
  --dygsom-gray-800: #1e293b;
  --dygsom-gray-900: #0f172a;
  
  /* Gradients */
  --dygsom-gradient-primary: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  --dygsom-gradient-primary-dark: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}
`;

export type DygsomColors = typeof dygsomTheme.colors;