import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../../lib/auth';
import prisma from '../../../../lib/db';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'ID no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar que la comida existe y pertenece al usuario
    const existingMeal = await prisma.meal.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!existingMeal) {
      return new Response(
        JSON.stringify({ message: 'Comida no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Eliminar la comida (las relaciones se eliminarán en cascada según el esquema)
    await prisma.meal.delete({
      where: { id },
    });
    
    return new Response(
      JSON.stringify({
        message: 'Comida eliminada exitosamente',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting meal:', error);
    return new Response(
      JSON.stringify({ message: 'Error al eliminar la comida' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};