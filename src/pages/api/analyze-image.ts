import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { analyzeImage, analyzeDescription } from '../../lib/openai';
import prisma from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { image, description, dishName } = await request.json();
    
    let analysisResult;
    
    if (image) {
      // Analizar la imagen con OpenAI
      analysisResult = await analyzeImage(image);
    } else if (description) {
      // Si no hay imagen pero hay descripción, extraer ingredientes de la descripción
      const ingredients = await analyzeDescription(description, dishName);
      
      // Crear un resultado parcial con solo los ingredientes
      analysisResult = {
        dishName: dishName || "Plato desconocido",
        ingredients,
        nutritionalData: {
          calories: 0,
          proteins: 0,
          carbohydrates: 0,
          fats: 0
        },
        accuracy: 60 // Menor precisión cuando solo usamos descripción
      };
    } else {
      return new Response(
        JSON.stringify({ message: 'No se proporcionó imagen ni descripción' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar ingredientes contra la base de datos y añadir los que no existan
    if (analysisResult.ingredients && analysisResult.ingredients.length > 0) {
      for (const ingredient of analysisResult.ingredients) {
        // Buscar si el ingrediente ya existe en la base de datos (por nombre)
        const existingIngredient = await prisma.ingredient.findUnique({
          where: { name: ingredient.name.toLowerCase() }
        });
        
        // Si no existe, crearlo
        if (!existingIngredient) {
          await prisma.ingredient.create({
            data: {
              name: ingredient.name.toLowerCase(),
              commonAllergen: ingredient.possibleAllergen,
              allergenType: ingredient.allergenType,
            }
          });
        }
      }
    }
    
    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing image or description:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error al analizar la comida',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};