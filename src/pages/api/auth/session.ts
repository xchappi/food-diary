import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Respuesta fija para desarrollo
  return new Response(JSON.stringify({
    user: {
      id: "test-user-id",
      name: "Usuario de Prueba",
      email: "test@example.com",
      image: null,
      createdAt: new Date().toISOString(),
      emailVerified: null
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};