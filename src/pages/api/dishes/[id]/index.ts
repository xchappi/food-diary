import type { APIRoute } from 'astro';
import prisma from '../../../../lib/db';
import { protectAPI } from '../../../../utils/auth';

export const GET: APIRoute = async ({ params, request }) => {
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
    
    // Obtener el plato con verificación de propiedad
    const dish = await prisma.dish.findFirst({
      where: {
        id,
        meal: {
          userId: user.id
        }
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
      }
    });
    
    if (!dish) {
      return new Response(
        JSON.stringify({ message: 'Plato no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(dish),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching dish:', error);
    return new Response(
      JSON.stringify({ message: 'Error al obtener plato' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
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
    const existingDish = await prisma.dish.findFirst({
      where: {
        id,
        meal: {
          userId: user.id
        }
      }
    });
    
    if (!existingDish) {
      return new Response(
        JSON.stringify({ message: 'Plato no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await request.json();
    
    // Actualizar el plato básico
    await prisma.dish.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        order: data.order || existingDish.order,
      }
    });
    
    // Actualizar información nutricional si existe
    if (data.nutritionalData) {
      // Verificar si ya existe información nutricional
      const existingNutritional = await prisma.nutritionalValue.findUnique({
        where: { dishId: id }
      });
      
      if (existingNutritional) {
        // Actualizar
        await prisma.nutritionalValue.update({
          where: { id: existingNutritional.id },
          data: {
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
      } else {
        // Crear nuevo
        await prisma.nutritionalValue.create({
          data: {
            dishId: id,
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
    }
    
    // Actualizar ingredientes si existen
    if (data.ingredients && Array.isArray(data.ingredients)) {
      // Eliminar ingredientes existentes
      await prisma.dishIngredient.deleteMany({
        where: { dishId: id }
      });
      
      // Añadir nuevos ingredientes
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
            dishId: id,
            ingredientId: dbIngredient.id,
            quantity: ingredient.quantity || null
          }
        });
      }
    }
    
    // Manejar imágenes
    if (data.images && Array.isArray(data.images)) {
      // Obtener imágenes existentes
      const existingImages = await prisma.mealImage.findMany({
        where: { dishId: id }
      });
      
      // Determinar qué imágenes deben eliminarse
      const existingImageIds = existingImages.map(img => img.id);
      const newImageIds = data.images
        .filter(img => img.id && !img.id.startsWith('temp-'))
        .map(img => img.id);
      
      const imagesToDelete = existingImageIds.filter(id => !newImageIds.includes(id));
      
      // Eliminar imágenes que ya no están en la lista
      if (imagesToDelete.length > 0) {
        await prisma.mealImage.deleteMany({
          where: {
            id: { in: imagesToDelete }
          }
        });
      }
      
      // Actualizar o crear imágenes
      let hasMainImage = false;
      
      for (const image of data.images) {
        const isMain = image.isMain && !hasMainImage;
        if (isMain) {
          hasMainImage = true;
        }
        
        if (image.id && !image.id.startsWith('temp-')) {
          // Actualizar imagen existente
          await prisma.mealImage.update({
            where: { id: image.id },
            data: {
              isMain: isMain,
              order: image.order || 0
            }
          });
        } else if (image.imageUrl && !image.imageUrl.startsWith('blob:')) {
          // Crear nueva imagen
          await prisma.mealImage.create({
            data: {
              dishId: id,
              imageUrl: image.imageUrl,
              isMain: isMain,
              order: image.order || 0,
            }
          });
        }
      }
      
      // Asegurar que hay una imagen principal
      if (!hasMainImage) {
        const firstImage = await prisma.mealImage.findFirst({
          where: { dishId: id },
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
    
    // Devolver el plato actualizado con todas sus relaciones
    const updatedDish = await prisma.dish.findUnique({
      where: { id },
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
      }
    });
    
    return new Response(
      JSON.stringify(updatedDish),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating dish:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error al actualizar el plato',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};