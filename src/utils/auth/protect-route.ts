import type { APIContext } from 'astro';
import { getCurrentUser } from '../../lib/auth';

// Middleware para proteger páginas que requieren autenticación
export async function protectRoute(context: APIContext) {
  const { request, redirect } = context;
  const user = await getCurrentUser(request);

  if (!user) {
    // Redirigir a la página de inicio de sesión si no hay usuario autenticado
    return redirect('/login?callbackUrl=' + encodeURIComponent(new URL(request.url).pathname));
  }

  // El usuario está autenticado, se puede continuar con la renderización de la página
  return { user };
}

// Middleware para proteger API endpoints
export async function protectAPI(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return { user };
}