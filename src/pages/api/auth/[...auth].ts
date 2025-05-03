import type { APIRoute } from 'astro';

// Endpoint simplificado para desarrollo
export const GET: APIRoute = async () => {
  // Redirigir al dashboard directamente en desarrollo
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/dashboard'
    }
  });
};

export const POST: APIRoute = async () => {
  // Redirigir al dashboard directamente en desarrollo
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/dashboard'
    }
  });
};