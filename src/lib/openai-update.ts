import OpenAI from 'openai';

const apiKey = import.meta.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key is not defined in environment variables');
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

// Tipos para la respuesta del API
interface IngredientInfo {
  name: string;
  possibleAllergen: boolean;
  allergenType?: string;
  quantity?: string;
}

interface AnalysisResult {
  dishName: string;
  ingredients: IngredientInfo[];
  nutritionalData: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber?: number;
    sugars?: number;
    sodium?: number;
  };
  accuracy: number;
}

/**
 * Analiza una imagen de comida utilizando OpenAI para extraer información nutricional e ingredientes
 */
export async function analyzeImage(base64Image: string): Promise<AnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",  // Modelo actualizado con capacidades de visión
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta imagen de comida y proporciona la siguiente información en formato JSON:
              1) "dishName": Nombre del plato.
              2) "ingredients": Lista detallada de ingredientes con los siguientes campos:
                 - "name": nombre del ingrediente
                 - "possibleAllergen": booleano que indica si es un alérgeno común (gluten, lactosa, frutos secos, huevo, soja, pescado, mariscos, apio, mostaza, sésamo, sulfitos, altramuz, moluscos, ajo, cebolla)
                 - "allergenType": tipo de alérgeno si aplica (ej: "gluten", "lactosa", etc.)
                 - "quantity": cantidad aproximada si es posible determinarla
              3) "nutritionalData": Valores nutricionales aproximados:
                 - "calories": calorías totales
                 - "proteins": gramos de proteínas
                 - "carbohydrates": gramos de carbohidratos
                 - "fats": gramos de grasas
                 - "fiber": gramos de fibra (opcional)
                 - "sugars": gramos de azúcares (opcional)
                 - "sodium": miligramos de sodio (opcional)
              4) "accuracy": nivel de confianza de 0 a 100 sobre la precisión del análisis.
              
              Responde ÚNICAMENTE con el JSON, sin texto adicional.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    // Extraer el JSON de la respuesta
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response:', response.choices[0].message.content);
      throw new Error('Failed to parse analysis response');
    }
    
    // Formatear la respuesta para asegurar consistencia
    return {
      dishName: jsonResponse.dishName || "Plato desconocido",
      ingredients: Array.isArray(jsonResponse.ingredients) 
        ? jsonResponse.ingredients.map((ingredient: any) => ({
            name: ingredient.name || "Ingrediente desconocido",
            possibleAllergen: ingredient.possibleAllergen || false,
            allergenType: ingredient.allergenType || null,
            quantity: ingredient.quantity || null
          }))
        : [],
      nutritionalData: {
        calories: jsonResponse.nutritionalData?.calories || 0,
        proteins: jsonResponse.nutritionalData?.proteins || 0,
        carbohydrates: jsonResponse.nutritionalData?.carbohydrates || 0,
        fats: jsonResponse.nutritionalData?.fats || 0,
        fiber: jsonResponse.nutritionalData?.fiber,
        sugars: jsonResponse.nutritionalData?.sugars,
        sodium: jsonResponse.nutritionalData?.sodium
      },
      accuracy: jsonResponse.accuracy || 70
    };
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    throw new Error('Failed to analyze food image');
  }
}

/**
 * Analiza una descripción de comida para extraer ingredientes
 */
export async function analyzeDescription(description: string, dishName: string = ""): Promise<IngredientInfo[]> {
  if (!description || description.trim().length < 5) {
    return [];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Extrae una lista de ingredientes de la siguiente descripción de comida${dishName ? ` (${dishName})` : ''}:
          
"${description}"

Proporciona la información en formato JSON con los siguientes campos para cada ingrediente:
- "name": nombre del ingrediente
- "possibleAllergen": booleano que indica si es un alérgeno común (gluten, lactosa, frutos secos, huevo, soja, pescado, mariscos, apio, mostaza, sésamo, sulfitos, altramuz, moluscos, ajo, cebolla)
- "allergenType": tipo de alérgeno si aplica (ej: "gluten", "lactosa", etc.)
- "quantity": cantidad aproximada si se menciona

Responde ÚNICAMENTE con un array JSON de ingredientes, sin texto adicional.`
        }
      ],
      max_tokens: 1000
    });

    // Extraer el JSON de la respuesta
    try {
      const ingredients = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(ingredients) 
        ? ingredients.map((ingredient: any) => ({
            name: ingredient.name || "Ingrediente desconocido",
            possibleAllergen: ingredient.possibleAllergen || false,
            allergenType: ingredient.allergenType || null,
            quantity: ingredient.quantity || null
          }))
        : [];
    } catch (error) {
      console.error('Error parsing ingredients response:', error);
      return [];
    }
  } catch (error) {
    console.error('Error analyzing description with OpenAI:', error);
    return [];
  }
}