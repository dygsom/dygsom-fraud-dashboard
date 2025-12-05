// 🔍 SCRIPT DE DEBUG MANUAL PARA AUTENTICACIÓN
// Ejecuta este código en la consola del navegador después de hacer login

console.log('🔍 INICIANDO DEBUG DE AUTENTICACIÓN...');

// 1. Verificar token en localStorage
const token = localStorage.getItem('dygsom_auth_token');
console.log('🔑 TOKEN EN LOCALSTORAGE:', {
  hasToken: !!token,
  tokenLength: token?.length || 0,
  tokenStart: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
  fullToken: token // ⚠️ Solo para debug - NO usar en producción
});

// 2. Verificar estado del contexto de autenticación (si está disponible)
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  console.log('⚛️ Intentando obtener estado de React Auth Context...');
}

// 3. Hacer request manual a la API para probar autenticación
async function testApiCall() {
  console.log('🧪 TESTEANDO LLAMADA A LA API...');
  
  const apiUrl = 'https://api.dygsom.pe/auth/me';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : 'NO TOKEN'
  };
  
  console.log('📡 REQUEST HEADERS:', headers);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });
    
    console.log('📥 RESPONSE STATUS:', response.status);
    console.log('📥 RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API CALL SUCCESS:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ API CALL FAILED:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
    }
  } catch (error) {
    console.error('🚨 NETWORK ERROR:', error);
  }
}

// 4. Ejecutar test automáticamente
testApiCall();

// 5. Función para limpiar y retest
window.debugAuth = {
  clearAndTest: () => {
    console.log('🧹 LIMPIANDO TOKEN Y RETEST...');
    localStorage.removeItem('dygsom_auth_token');
    console.log('Token limpiado. Ahora haz login nuevamente y ejecuta debugAuth.testAfterLogin()');
  },
  
  testAfterLogin: () => {
    console.log('🔄 RE-EJECUTANDO TESTS POST-LOGIN...');
    const newToken = localStorage.getItem('dygsom_auth_token');
    console.log('🔑 NUEVO TOKEN:', {
      hasToken: !!newToken,
      tokenLength: newToken?.length || 0,
      tokenStart: newToken ? newToken.substring(0, 30) + '...' : 'NO TOKEN'
    });
    testApiCall();
  },
  
  checkCurrentState: () => {
    console.log('📊 ESTADO ACTUAL:', {
      currentPath: window.location.pathname,
      hasToken: !!localStorage.getItem('dygsom_auth_token'),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }
};

console.log('✅ DEBUG SCRIPT CARGADO. Comandos disponibles:');
console.log('- debugAuth.clearAndTest() - Limpiar token y retest');
console.log('- debugAuth.testAfterLogin() - Test después de login');  
console.log('- debugAuth.checkCurrentState() - Ver estado actual');