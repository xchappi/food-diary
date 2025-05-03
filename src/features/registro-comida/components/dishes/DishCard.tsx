import React from 'react';
import { type Dish } from './DishForm';

interface DishCardProps {
  dish: Dish;
  index: number;
  onClick?: () => void;
  selected?: boolean;
}

/**
 * Componente para mostrar una vista resumida de un plato en formato de tarjeta
 * Útil para seleccionar platos o mostrar resúmenes
 */
const DishCard: React.FC<DishCardProps> = ({ 
  dish, 
  index, 
  onClick,
  selected = false 
}) => {
  // Encontrar la imagen principal si existe
  const mainImage = dish.images?.find(img => img.isMain) || dish.images?.[0];
  
  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all cursor-pointer
        ${selected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md bg-white dark:bg-gray-800'
        }`}
      onClick={onClick}
    >
      <div className="flex h-full">
        {/* Imagen del plato */}
        <div className="w-1/3 flex-shrink-0">
          {mainImage ? (
            <img 
              src={mainImage.imageUrl} 
              alt={dish.name}
              className="w-full h-full object-cover"
              style={{ maxHeight: '120px' }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-gray-400 dark:text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Información del plato */}
        <div className="w-2/3 p-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {dish.name || `Plato ${index + 1}`}
            </h3>
            {selected && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-primary-500 dark:text-primary-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </div>
          
          {/* Resumen de ingredientes */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {dish.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}
              {dish.ingredients.length > 3 ? ` y ${dish.ingredients.length - 3} más` : ''}
            </p>
          )}
          
          {/* Información nutricional resumida si existe */}
          {dish.nutritionalData && (
            <div className="mt-2 flex items-center space-x-3 text-xs">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                {dish.nutritionalData.calories.toFixed(0)} kcal
              </span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                {dish.nutritionalData.proteins.toFixed(1)}g prot
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;