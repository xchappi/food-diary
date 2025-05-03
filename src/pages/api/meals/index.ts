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
        },
        symptoms: {
          select: {
            id: true,
            wellnessLevel: true,
            symptoms: true,
          },
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
    
    // Validar que hay al menos un plato
    if (!data.dishes || !Array.isArray(data.dishes) || data.dishes.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Debe incluir al menos un plato' }),
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
    
    // Procesar cada plato
    for (let i = 0; i < data.dishes.length; i++) {
      const dishData = data.dishes[i];
      
      // Crear el plato
      const dish = await prisma.dish.create({
        data: {
          mealId: meal.id,
          name: dishData.name,
          description: dishData.description || null,
          order: i,
        }
      });
      
      // Si hay información nutricional, crearla
      if (dishData.nutritionalData) {
        try {
          // Asegurarnos de que los valores numéricos sean válidos
          const nutritionalData = {
            dishId: dish.id,
            calories: parseFloat(dishData.nutritionalData.calories) || 0,
            proteins: parseFloat(dishData.nutritionalData.proteins) || 0,
            carbohydrates: parseFloat(dishData.nutritionalData.carbohydrates) || 0,
            fats: parseFloat(dishData.nutritionalData.fats) || 0,
            fiber: dishData.nutritionalData.fiber ? parseFloat(dishData.nutritionalData.fiber) : null,
            sugars: dishData.nutritionalData.sugars ? parseFloat(dishData.nutritionalData.sugars) : null,
            sodium: dishData.nutritionalData.sodium ? parseFloat(dishData.nutritionalData.sodium) : null,
            dataSource: 'AI',
            accuracy: dishData.nutritionalData.accuracy || 70,
            vitamins: dishData.nutritionalData.vitamins || {},
            minerals: dishData.nutritionalData.minerals || {}
          };
          
          await prisma.nutritionalValue.create({
            data: nutritionalData
          });
          
          console.log(`Valores nutricionales guardados para plato ${dish.id}:`, nutritionalData);
        } catch (error) {
          console.error(`Error al guardar valores nutricionales para plato ${dish.id}:`, error);
          throw error;
        }
      }
      
      // Si hay ingredientes, guardarlos
      if (dishData.ingredients && Array.isArray(dishData.ingredients) && dishData.ingredients.length > 0) {
        try {
          console.log(`Procesando ${dishData.ingredients.length} ingredientes para el plato ${dish.id}`);
          
          for (const ingredient of dishData.ingredients) {
            // Validar que el ingrediente tenga un nombre
            if (!ingredient.name || ingredient.name.trim() === '') {
              console.warn('Se encontró un ingrediente sin nombre, omitiendo...');
              continue;
            }
            
            const ingredientName = ingredient.name.trim().toLowerCase();
            
            // Buscar si el ingrediente ya existe en la base de datos
            let dbIngredient = await prisma.ingredient.findUnique({
              where: { name: ingredientName }
            });
            
            // Si no existe, crearlo
            if (!dbIngredient) {
              console.log(`Creando nuevo ingrediente: "${ingredientName}"`);
              dbIngredient = await prisma.ingredient.create({
                data: {
                  name: ingredientName,
                  commonAllergen: !!ingredient.possibleAllergen,
                  allergenType: ingredient.possibleAllergen ? ingredient.allergenType : null,
                  category: ingredient.category || null
                }
              });
            } else {
              console.log(`Ingrediente encontrado en BD: "${ingredientName}" (ID: ${dbIngredient.id})`);
            }
            
            // Crear la relación entre el plato y el ingrediente
            console.log(`Asociando ingrediente "${ingredientName}" al plato ${dish.id}`);
            await prisma.dishIngredient.create({
              data: {
                dishId: dish.id,
                ingredientId: dbIngredient.id,
                quantity: ingredient.quantity || null
              }
            });
            
            console.log(`Ingrediente "${ingredientName}" asociado correctamente al plato ${dish.id}`);
          }
        } catch (error) {
          console.error(`Error al guardar ingredientes para plato ${dish.id}:`, error);
          throw error;
        }
      } else {
        console.log(`No se encontraron ingredientes para el plato ${dish.id}`);
      }
      
      // No se guardan imágenes - solo se utilizan para análisis
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
      JSON.stringify({ 
        message: 'Error al crear la comida',
        error: error instanceof Error ? error.message : 'Unknown error'  
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};