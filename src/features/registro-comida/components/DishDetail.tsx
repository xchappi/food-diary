import React from 'react';
import { type Dish } from './dishes';

interface DishDetailProps {
  dish: Dish;
  index: number;
}

const DishDetail: React.FC<DishDetailProps> = ({ dish, index }) => {
  // Encontrar la imagen principal
  const mainImage = dish.images?.find(img => img.isMain) || dish.images?.[0];
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {dish.name}
        </h3>
        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
          Plato #{index + 1}
        </span>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagen principal */}
          {mainImage && (
            <div>
              <img 
                src={mainImage.imageUrl} 
                alt={dish.name} 
                className="w-full h-48 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}
          
          {/* Información del plato */}
          <div className="space-y-4">
            {dish.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción:
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {dish.description}
                </p>
              </div>
            )}
            
            {/* Ingredientes */}
            {dish.ingredients && dish.ingredients.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ingredientes:
                </h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {dish.ingredients.map((ingredient, i) => (
                    <li key={i} className="mb-1">
                      <span className="font-medium">{ingredient.name}</span>
                      {ingredient.quantity && ` (${ingredient.quantity})`}
                      {ingredient.possibleAllergen && (
                        <span className="ml-1 text-red-600 dark:text-red-400 text-xs">
                          ⚠️ Alérgeno: {ingredient.allergenType || "Común"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Información nutricional */}
            {dish.nutritionalData && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Información Nutricional:
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Calorías:</span>
                      <span className="ml-1 font-medium">{dish.nutritionalData.calories} kcal</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Proteínas:</span>
                      <span className="ml-1 font-medium">{dish.nutritionalData.proteins}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Carbohidratos:</span>
                      <span className="ml-1 font-medium">{dish.nutritionalData.carbohydrates}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Grasas:</span>
                      <span className="ml-1 font-medium">{dish.nutritionalData.fats}g</span>
                    </div>
                    
                    {dish.nutritionalData.fiber && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Fibra:</span>
                        <span className="ml-1 font-medium">{dish.nutritionalData.fiber}g</span>
                      </div>
                    )}
                    
                    {dish.nutritionalData.sugars && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Azúcares:</span>
                        <span className="ml-1 font-medium">{dish.nutritionalData.sugars}g</span>
                      </div>
                    )}
                    
                    {dish.nutritionalData.sodium && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sodio:</span>
                        <span className="ml-1 font-medium">{dish.nutritionalData.sodium}mg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Carrusel de imágenes adicionales */}
        {dish.images && dish.images.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Más imágenes ({dish.images.length}):
            </h4>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {dish.images.map((image, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 ${
                    image.isMain ? "border-2 border-primary-500" : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`${dish.name} - Imagen ${i + 1}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishDetail;