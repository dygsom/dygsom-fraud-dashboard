#!/usr/bin/env tsx
/**
 * Script de validación de branding DYGSOM
 * Verifica que todos los componentes usen correctamente:
 * - Logo oficial DYGSOM
 * - Sistema de colores consistente
 * - Componentes reutilizables
 * - Mejores prácticas de Next.js
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  file: string;
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

const COMPONENTS_TO_CHECK = [
  'components/layout/Header.tsx',
  'components/layout/Sidebar.tsx',
  'app/(auth)/login/page.tsx',
  'components/ui/dygsom-logo.tsx'
];

const REQUIRED_PATTERNS = {
  dygsomLogo: /DygsomLogo|DygsomBrand/,
  dygsomClasses: /dygsom-/,
  nextImage: /next\/image/,
  typescript: /interface|type/,
};

function validateFile(filePath: string): ValidationResult {
  const fullPath = path.join(process.cwd(), filePath);
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!fs.existsSync(fullPath)) {
    return {
      file: filePath,
      passed: false,
      issues: ['Archivo no encontrado'],
      suggestions: ['Crear el archivo faltante']
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Verificar uso del logo DYGSOM
  if (filePath.includes('layout') || filePath.includes('login')) {
    if (!REQUIRED_PATTERNS.dygsomLogo.test(content)) {
      issues.push('No usa el componente oficial DygsomLogo/DygsomBrand');
      suggestions.push('Reemplazar SVG inline con componente DygsomLogo');
    }
  }

  // Verificar clases DYGSOM
  if (!REQUIRED_PATTERNS.dygsomClasses.test(content) && !filePath.includes('dygsom-logo')) {
    issues.push('No usa clases del sistema de diseño DYGSOM');
    suggestions.push('Aplicar clases dygsom-* para consistencia');
  }

  // Verificar optimización de imágenes
  if (filePath.includes('dygsom-logo') && !REQUIRED_PATTERNS.nextImage.test(content)) {
    issues.push('No usa Next.js Image para optimización');
    suggestions.push('Usar next/image para mejor rendimiento');
  }

  // Verificar TypeScript
  if (!REQUIRED_PATTERNS.typescript.test(content)) {
    issues.push('Falta tipado TypeScript');
    suggestions.push('Agregar interfaces y types apropiados');
  }

  return {
    file: filePath,
    passed: issues.length === 0,
    issues,
    suggestions
  };
}

function generateReport(): void {
  console.log('🔍 VALIDACIÓN DE BRANDING DYGSOM\n');
  console.log('=====================================\n');

  const results = COMPONENTS_TO_CHECK.map(validateFile);
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.file}`);
    
    if (result.issues.length > 0) {
      console.log('   Problemas encontrados:');
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    if (result.suggestions.length > 0) {
      console.log('   Sugerencias:');
      result.suggestions.forEach(suggestion => console.log(`   • ${suggestion}`));
    }
    
    console.log();
  });

  console.log('=====================================');
  console.log(`Resultado: ${passedCount}/${totalCount} archivos válidos`);
  
  if (passedCount === totalCount) {
    console.log('🎉 ¡Excelente! Todos los componentes siguen las mejores prácticas DYGSOM');
  } else {
    console.log('⚠️  Algunos componentes necesitan mejoras para seguir las mejores prácticas');
  }
}

function checkAssetStructure(): void {
  console.log('\n📁 VALIDACIÓN DE ESTRUCTURA DE ASSETS\n');
  console.log('=====================================\n');

  const requiredAssets = [
    'public/dygsom-logo.svg',
    'lib/theme/dygsom-theme.ts',
    'components/ui/dygsom-logo.tsx'
  ];

  requiredAssets.forEach(asset => {
    const exists = fs.existsSync(path.join(process.cwd(), asset));
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${asset}`);
  });
}

function main(): void {
  generateReport();
  checkAssetStructure();
  
  console.log('\n🚀 PRÓXIMOS PASOS RECOMENDADOS:\n');
  console.log('1. Ejecutar npm run build para validar la compilación');
  console.log('2. Probar componentes en diferentes tamaños de pantalla');
  console.log('3. Validar accesibilidad con lectores de pantalla');
  console.log('4. Optimizar rendimiento con Lighthouse');
  console.log('5. Implementar tests unitarios para componentes de branding');
}

main();