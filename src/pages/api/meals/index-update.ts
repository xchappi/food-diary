import type { APIRoute } from 'astro';
import prisma from '../../../lib/db';
import { protectAPI } from '../../../utils/auth';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Obtener comidas paginadas
    const meals = await prisma.meal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' },
      ],
      include: {
        nutritionalValue: true,
        symptoms: {
          select: {
            id: true,
            wellnessLevel: true,
            symptoms: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true
          }
        }
      },
      skip,
      take: limit,
    });
    
    // Contar total para meta de paginación
    const total = await prisma.meal.count({
      where: {
        userId: user.id,
      },
    });
    
    return new Response(
      JSON.stringify({
        data: meals,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching meals:', error);
    return new Response(
      JSON.stringify({ message: 'Error al obtener comidas' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    const data = await request.json();
    
    // Validar datos recibidos
    if (!data.date || !data.time || !data.mealType) {
      return new Response(
        JSON.stringify({ message: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Crear registro de comida
    const meal = await prisma.meal.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        time: new Date(`1970-01-01T${data.time}:00`),
        mealType: data.mealType,
        description: data.description || null,
        dishName: data.dishName || null,
      },
    });
    
    // Si hay información nutricional, crearla también
    if (data.nutritionalData) {
      await prisma.nutritionalValue.create({
        data: {
          mealId: meal.id,
          calories: data.nutritionalData.calories || 0,
          proteins: data.nutritionalData.proteins || 0,
          carbohydrates: data.nutritionalData.carbohydrates || 0,
          fats: data.nutritionalData.fats || 0,
          fiber: data.nutritionalData.fiber || null,
          sugars: data.nutritionalData.sugars || null,
          sodium: data.nutritionalData.sodium || null,
          dataSource: 'AI',
          accuracy: data.accuracy || null,
        }
      });
    }
    
    // Si hay ingredientes, guardarlos
    if (data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length > 0) {
      for (const ingredient of data.ingredients) {
        // Buscar si el ingrediente ya existe en la base de datos
        let dbIngredient = await prisma.ingredient.findUnique({
          where: { name: ingredient.name.toLowerCase() }
        });
        
        // Si no existe, crearlo
        if (!dbIngredient) {
          dbIngredient = await prisma.ingredient.create({
            data: {
              name: ingredient.name.toLowerCase(),
              commonAllergen: ingredient.possibleAllergen || false,
              allergenType: ingredient.allergenType || null,
            }
          });
        }
        
        // Crear la relación entre la comida y el ingrediente
        await prisma.mealIngredient.create({
          data: {
            mealId: meal.id,
            ingredientId: dbIngredient.id,
            quantity: ingredient.quantity || null
          }
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        message: 'Comida creada exitosamente',
        id: meal.id,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating meal:', error);
    return new Response(
      JSON.stringify({ message: 'Error al crear la comida' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};