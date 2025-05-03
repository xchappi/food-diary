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
        symptoms: {
          select: {
            id: true,
            wellnessLevel: true,
            symptoms: true,
          },
        },
        dishes: {
          include: {
            nutritionalValue: true,
            ingredients: {
              include: {
                ingredient: true
              }
            }
          },
          orderBy: { order: 'asc' }
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
      },
    });
    
    // Crear platos asociados a la comida
    if (data.dishes && Array.isArray(data.dishes) && data.dishes.length > 0) {
      // Crear cada plato enviado
      for (const dish of data.dishes) {
        await prisma.dish.create({
          data: {
            mealId: meal.id,
            name: dish.name,
            description: dish.description || data.description || null,
            order: dish.order || 0,
          }
        });
      }
    } 
    // Si no hay platos pero hay un nombre de plato, crear un plato con ese nombre
    else if (data.dishName) {
      await prisma.dish.create({
        data: {
          mealId: meal.id,
          name: data.dishName,
          description: data.description || null,
          order: 0, // Primer plato de la comida
        }
      });
    }
    
    // Si hay información nutricional, crearla también
    if (data.nutritionalData) {
      // Obtener el plato principal o crear uno si no existe
      let mainDish = await prisma.dish.findFirst({
        where: { mealId: meal.id },
        orderBy: { order: 'asc' }
      });
      
      // Si no hay plato, crear uno genérico
      if (!mainDish) {
        mainDish = await prisma.dish.create({
          data: {
            mealId: meal.id,
            name: data.dishName || 'Plato principal',
            description: data.description || null,
            order: 0
          }
        });
      }
      
      await prisma.nutritionalValue.create({
        data: {
          dishId: mainDish.id,
          calories: parseFloat(data.nutritionalData.calories) || 0,
          proteins: parseFloat(data.nutritionalData.proteins) || 0,
          carbohydrates: parseFloat(data.nutritionalData.carbohydrates) || 0,
          fats: parseFloat(data.nutritionalData.fats) || 0,
          fiber: data.nutritionalData.fiber ? parseFloat(data.nutritionalData.fiber) : null,
          sugars: data.nutritionalData.sugars ? parseFloat(data.nutritionalData.sugars) : null,
          sodium: data.nutritionalData.sodium ? parseFloat(data.nutritionalData.sodium) : null,
          dataSource: data.nutritionalData.dataSource || 'AI',
          accuracy: parseFloat(data.nutritionalData.accuracy) || null,
        }
      });
    }
    
    // Si hay ingredientes, guardarlos
    if (data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length > 0) {
      // Obtener el plato principal o crear uno si no existe
      let mainDish = await prisma.dish.findFirst({
        where: { mealId: meal.id },
        orderBy: { order: 'asc' }
      });
      
      // Si no hay plato, crear uno genérico
      if (!mainDish) {
        mainDish = await prisma.dish.create({
          data: {
            mealId: meal.id,
            name: data.dishName || 'Plato principal',
            description: data.description || null,
            order: 0
          }
        });
      }
      
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
        
        // Crear la relación entre el plato y el ingrediente
        await prisma.dishIngredient.create({
          data: {
            dishId: mainDish.id,
            ingredientId: dbIngredient.id,
            quantity: ingredient.quantity || null
          }
        });
      }
    }

    // No se guardan imágenes - se utilizan solo para análisis
    
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