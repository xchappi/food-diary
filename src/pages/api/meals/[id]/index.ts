import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../../lib/auth';
import prisma from '../../../../lib/db';

export const GET: APIRoute = async ({ params, request }) => {
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
    
    // Obtener la comida con sus detalles
    const meal = await prisma.meal.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        nutritionalValue: true,
        symptoms: true,
        ingredients: {
          include: {
            ingredient: true
          }
        },

      },
    });
    
    if (!meal) {
      return new Response(
        JSON.stringify({ message: 'Comida no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(meal),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching meal:', error);
    return new Response(
      JSON.stringify({ message: 'Error al obtener la comida' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
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
      include: {
        dishes: {
          include: {
            ingredients: true,
            nutritionalValue: true
          }
        }
      }
    });
    
    if (!existingMeal) {
      return new Response(
        JSON.stringify({ message: 'Comida no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await request.json();
    
    // Validar datos recibidos
    if (!data.date || !data.time || !data.mealType) {
      return new Response(
        JSON.stringify({ message: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Iniciar una transacción para asegurar que todas las operaciones sean atómicas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos de la comida
      const updatedMeal = await tx.meal.update({
        where: { id },
        data: {
          date: new Date(data.date),
          time: new Date(`1970-01-01T${data.time}:00`),
          mealType: data.mealType,
          description: data.description || null
        },
      });
      
      // 2. Eliminar platos, ingredientes y valores nutricionales que ya no están en la nueva versión
      if (data.dishes && Array.isArray(data.dishes)) {
        const newDishIds = data.dishes
          .filter(dish => dish.id && !dish.id.startsWith('temp-'))
          .map(dish => dish.id);
          
        // Obtener los IDs de platos que se van a eliminar (están en la BD pero no en el nuevo payload)
        const dishesToDelete = existingMeal.dishes
          .filter(dish => !newDishIds.includes(dish.id))
          .map(dish => dish.id);
        
        // Eliminar los platos que ya no están en la lista
        if (dishesToDelete.length > 0) {
          await tx.dish.deleteMany({
            where: {
              id: { in: dishesToDelete }
            }
          });
        }
      }
      
      // 3. Actualizar o crear platos y sus relaciones
      if (data.dishes && Array.isArray(data.dishes)) {
        for (let i = 0; i < data.dishes.length; i++) {
          const dishData = data.dishes[i];
          const isDishNew = !dishData.id || dishData.id.startsWith('temp-');
          
          // Si es un plato nuevo, crearlo
          if (isDishNew) {
            const newDish = await tx.dish.create({
              data: {
                mealId: updatedMeal.id,
                name: dishData.name,
                description: dishData.description || null,
                order: i
              }
            });
            
            // 3.1 Crear valores nutricionales si existen
            if (dishData.nutritionalData) {
              await tx.nutritionalValue.create({
                data: {
                  dishId: newDish.id,
                  calories: dishData.nutritionalData.calories || 0,
                  proteins: dishData.nutritionalData.proteins || 0,
                  carbohydrates: dishData.nutritionalData.carbohydrates || 0,
                  fats: dishData.nutritionalData.fats || 0,
                  fiber: dishData.nutritionalData.fiber || null,
                  sugars: dishData.nutritionalData.sugars || null,
                  sodium: dishData.nutritionalData.sodium || null,
                  dataSource: 'AI',
                  accuracy: 70 // Valor por defecto para datos nuevos
                }
              });
            }
            
            // 3.2 Crear ingredientes si existen
            if (dishData.ingredients && Array.isArray(dishData.ingredients) && dishData.ingredients.length > 0) {
              for (const ingredient of dishData.ingredients) {
                // Buscar o crear el ingrediente
                let dbIngredient = await tx.ingredient.findUnique({
                  where: { name: ingredient.name.toLowerCase() }
                });
                
                if (!dbIngredient) {
                  dbIngredient = await tx.ingredient.create({
                    data: {
                      name: ingredient.name.toLowerCase(),
                      commonAllergen: ingredient.possibleAllergen || false,
                      allergenType: ingredient.allergenType || null
                    }
                  });
                }
                
                // Crear la relación entre plato e ingrediente
                await tx.dishIngredient.create({
                  data: {
                    dishId: newDish.id,
                    ingredientId: dbIngredient.id,
                    quantity: ingredient.quantity || null
                  }
                });
              }
            }
          } else {
            // 3.3 Si el plato ya existe, actualizarlo
            const existingDish = await tx.dish.update({
              where: { id: dishData.id },
              data: {
                name: dishData.name,
                description: dishData.description || null,
                order: i
              }
            });
            
            // 3.4 Actualizar valores nutricionales
            if (dishData.nutritionalData) {
              await tx.nutritionalValue.upsert({
                where: { dishId: existingDish.id },
                update: {
                  calories: dishData.nutritionalData.calories || 0,
                  proteins: dishData.nutritionalData.proteins || 0,
                  carbohydrates: dishData.nutritionalData.carbohydrates || 0,
                  fats: dishData.nutritionalData.fats || 0,
                  fiber: dishData.nutritionalData.fiber || null,
                  sugars: dishData.nutritionalData.sugars || null,
                  sodium: dishData.nutritionalData.sodium || null,
                  dataSource: 'AI'
                },
                create: {
                  dishId: existingDish.id,
                  calories: dishData.nutritionalData.calories || 0,
                  proteins: dishData.nutritionalData.proteins || 0,
                  carbohydrates: dishData.nutritionalData.carbohydrates || 0,
                  fats: dishData.nutritionalData.fats || 0,
                  fiber: dishData.nutritionalData.fiber || null,
                  sugars: dishData.nutritionalData.sugars || null,
                  sodium: dishData.nutritionalData.sodium || null,
                  dataSource: 'AI',
                  accuracy: 70
                }
              });
            }
            
            // 3.5 Eliminar ingredientes antiguos
            await tx.dishIngredient.deleteMany({
              where: { dishId: existingDish.id }
            });
            
            // 3.6 Crear nuevos ingredientes
            if (dishData.ingredients && Array.isArray(dishData.ingredients) && dishData.ingredients.length > 0) {
              for (const ingredient of dishData.ingredients) {
                // Buscar o crear el ingrediente
                let dbIngredient = await tx.ingredient.findUnique({
                  where: { name: ingredient.name.toLowerCase() }
                });
                
                if (!dbIngredient) {
                  dbIngredient = await tx.ingredient.create({
                    data: {
                      name: ingredient.name.toLowerCase(),
                      commonAllergen: ingredient.possibleAllergen || false,
                      allergenType: ingredient.allergenType || null
                    }
                  });
                }
                
                // Crear la relación entre plato e ingrediente
                await tx.dishIngredient.create({
                  data: {
                    dishId: existingDish.id,
                    ingredientId: dbIngredient.id,
                    quantity: ingredient.quantity || null
                  }
                });
              }
            }
          }
        }
      }
      
      return updatedMeal;
    });
    
    return new Response(
      JSON.stringify({
        message: 'Comida actualizada exitosamente',
        id: result.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating meal:', error);
    return new Response(
      JSON.stringify({ message: 'Error al actualizar la comida' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};