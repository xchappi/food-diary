import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  // Simplemente redirigimos a la página principal
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/'
    }
  });
};