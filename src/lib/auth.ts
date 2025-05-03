// Usamos un enfoque minimalista para evitar errores con Auth
import Google from '@auth/core/providers/google';
import Apple from '@auth/core/providers/apple';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './db';

export const authOptions = {
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: import.meta.env.APPLE_CLIENT_ID,
      clientSecret: import.meta.env.APPLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: import.meta.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

// Método temporal para auth hasta resolver problemas con @auth/core
export function auth(req: Request) {
  // No usamos Auth directamente para evitar errores
  // En su lugar, devolvemos una respuesta predefinida para desarrollo
  return new Response(JSON.stringify({
    user: null,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Siempre usamos un usuario de prueba para desarrollo
export async function getCurrentUser(request: Request) {
  const testUserId = "test-user-id";
  
  // Verificar si el usuario de prueba existe, si no, crearlo
  try {
    let user = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    });
    
    if (!user) {
      // Crear el usuario de prueba si no existe
      user = await prisma.user.create({
        data: {
          id: testUserId,
          name: "Usuario de Prueba",
          email: "test@example.com",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log("Usuario de prueba creado con ID:", user.id);
    }
    
    return user;
  } catch (error) {
    console.error("Error al buscar/crear usuario de prueba:", error);
    // Devolver un objeto de usuario sin interactuar con la base de datos
    // en caso de que haya problemas con Prisma
    return {
      id: testUserId,
      name: "Usuario de Prueba",
      email: "test@example.com",
      image: null,
      createdAt: new Date().toISOString(),
      emailVerified: null,
      updatedAt: new Date().toISOString(),
    };
  }
}