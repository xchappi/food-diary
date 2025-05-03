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
    const mealId = url.searchParams.get('mealId');
    
    if (!mealId) {
      return new Response(
        JSON.stringify({ message: 'Se requiere el ID de la comida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar que la comida pertenezca al usuario
    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId: user.id
      }
    });
    
    if (!meal) {
      return new Response(
        JSON.stringify({ message: 'Comida no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Obtener los platos de la comida
    const dishes = await prisma.dish.findMany({
      where: {
        mealId: mealId
      },
      include: {
        nutritionalValue: true,
        ingredients: {
          include: {
            ingredient: true
          }
        },
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    
    return new Response(
      JSON.stringify(dishes),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching dishes:', error);
    return new Response(
      JSON.stringify({ message: 'Error al obtener platos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) return authResult;
    
    const data = await request.json();
    
    // Validar datos recibidos
    if (!data.mealId || !data.name) {
      return new Response(
        JSON.stringify({ message: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar que la comida exista y pertenezca al usuario
    const { user } = authResult;
    const meal = await prisma.meal.findFirst({
      where: {
        id: data.mealId,
        userId: user.id
      }
    });
    
    if (!meal) {
      return new Response(
        JSON.stringify({ message: 'Comida no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Obtener el último orden
    const lastDish = await prisma.dish.findFirst({
      where: { mealId: data.mealId },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = lastDish ? lastDish.order + 1 : 0;
    
    // Crear el plato
    const dish = await prisma.dish.create({
      data: {
        mealId: data.mealId,
        name: data.name,
        description: data.description || null,
        order: newOrder,
      }
    });
    
    // Si hay información nutricional, crearla
    if (data.nutritionalData) {
      await prisma.nutritionalValue.create({
        data: {
          dishId: dish.id,
          calories: parseFloat(data.nutritionalData.calories) || 0,
          proteins: parseFloat(data.nutritionalData.proteins) || 0,
          carbohydrates: parseFloat(data.nutritionalData.carbohydrates) || 0,
          fats: parseFloat(data.nutritionalData.fats) || 0,
          fiber: data.nutritionalData.fiber ? parseFloat(data.nutritionalData.fiber) : null,
          sugars: data.nutritionalData.sugars ? parseFloat(data.nutritionalData.sugars) : null,
          sodium: data.nutritionalData.sodium ? parseFloat(data.nutritionalData.sodium) : null,
          dataSource: data.nutritionalData.dataSource || 'AI',
          accuracy: parseFloat(data.nutritionalData.accuracy) || 70,
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
        
        // Crear la relación entre el plato y el ingrediente
        await prisma.dishIngredient.create({
          data: {
            dishId: dish.id,
            ingredientId: dbIngredient.id,
            quantity: ingredient.quantity || null
          }
        });
      }
    }
    
    // Si hay imágenes, guardarlas
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      let hasMainImage = false;

      for (const image of data.images) {
        const isMain = image.isMain && !hasMainImage;
        if (isMain) {
          hasMainImage = true;
        }

        await prisma.mealImage.create({
          data: {
            dishId: dish.id,
            imageUrl: image.imageUrl,
            isMain: isMain,
            order: image.order || 0,
          }
        });
      }

      if (!hasMainImage && data.images.length > 0) {
        const firstImage = await prisma.mealImage.findFirst({
          where: { dishId: dish.id },
          orderBy: { order: 'asc' }
        });
        
        if (firstImage) {
          await prisma.mealImage.update({
            where: { id: firstImage.id },
            data: { isMain: true }
          });
        }
      }
    }
    
    // Devolver el plato creado con sus relaciones
    const createdDish = await prisma.dish.findUnique({
      where: { id: dish.id },
      include: {
        nutritionalValue: true,
        ingredients: {
          include: {
            ingredient: true
          }
        },
        images: true
      }
    });
    
    return new Response(
      JSON.stringify(createdDish),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating dish:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error al crear el plato',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};