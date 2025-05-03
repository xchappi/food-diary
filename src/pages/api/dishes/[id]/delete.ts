import type { APIRoute } from 'astro';
import prisma from '../../../../lib/db';
import { protectAPI } from '../../../../utils/auth';

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    const id = params.id;
    
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'ID de plato requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar que el plato exista y pertenezca al usuario
    const dish = await prisma.dish.findFirst({
      where: {
        id,
        meal: {
          userId: user.id
        }
      },
      include: {
        meal: true
      }
    });
    
    if (!dish) {
      return new Response(
        JSON.stringify({ message: 'Plato no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Eliminar el plato (las relaciones se eliminarán en cascada por la configuración onDelete)
    await prisma.dish.delete({
      where: { id }
    });
    
    // Reordenar los platos restantes
    const remainingDishes = await prisma.dish.findMany({
      where: {
        mealId: dish.mealId,
      },
      orderBy: { order: 'asc' }
    });
    
    // Actualizar los órdenes
    for (let i = 0; i < remainingDishes.length; i++) {
      await prisma.dish.update({
        where: { id: remainingDishes[i].id },
        data: { order: i }
      });
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Plato eliminado con éxito',
        mealId: dish.mealId
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting dish:', error);
    return new Response(
      JSON.stringify({ message: 'Error al eliminar el plato' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};