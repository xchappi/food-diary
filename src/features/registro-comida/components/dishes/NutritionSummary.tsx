import React from 'react';
import { type Dish } from './DishForm';

interface NutritionSummaryProps {
  dishes: Dish[];
  className?: string;
}

/**
 * Componente para mostrar un resumen de la información nutricional de todos los platos
 */
const NutritionSummary: React.FC<NutritionSummaryProps> = ({ dishes, className = '' }) => {
  // Filtrar platos que tienen información nutricional
  const dishesWithNutrition = dishes.filter(dish => dish.nutritionalData);
  
  // Si no hay platos con información nutricional, no mostrar nada
  if (dishesWithNutrition.length === 0) {
    return null;
  }
  
  // Calcular totales
  const totals = {
    calories: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.calories || 0), 0),
    proteins: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.proteins || 0), 0),
    carbohydrates: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.carbohydrates || 0), 0),
    fats: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.fats || 0), 0),
    fiber: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.fiber || 0), 0),
    sugars: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.sugars || 0), 0),
    sodium: dishesWithNutrition.reduce((sum, dish) => sum + (dish.nutritionalData?.sodium || 0), 0),
  };
  
  // Calcular porcentajes basados en una dieta estándar de 2000 kcal
  const dailyValues = {
    proteins: (totals.proteins / 50) * 100, // 50g es el valor diario recomendado
    carbohydrates: (totals.carbohydrates / 275) * 100, // 275g
    fats: (totals.fats / 78) * 100, // 78g
    calories: (totals.calories / 2000) * 100, // 2000 kcal
  };

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Resumen Nutricional ({dishesWithNutrition.length} de {dishes.length} platos)
        </h3>
      </div>
      
      <div className="p-4">
        {/* Macronutrientes principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <span className="block text-sm text-gray-500 dark:text-gray-400">Calorías</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totals.calories.toFixed(0)} kcal</span>
            <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(dailyValues.calories, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{dailyValues.calories.toFixed(0)}% del valor diario</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <span className="block text-sm text-gray-500 dark:text-gray-400">Proteínas</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totals.proteins.toFixed(1)}g</span>
            <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${Math.min(dailyValues.proteins, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{dailyValues.proteins.toFixed(0)}% del valor diario</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <span className="block text-sm text-gray-500 dark:text-gray-400">Carbohidratos</span>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totals.carbohydrates.toFixed(1)}g</span>
            <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full" 
                style={{ width: `${Math.min(dailyValues.carbohydrates, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{dailyValues.carbohydrates.toFixed(0)}% del valor diario</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <span className="block text-sm text-gray-500 dark:text-gray-400">Grasas</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{totals.fats.toFixed(1)}g</span>
            <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${Math.min(dailyValues.fats, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{dailyValues.fats.toFixed(0)}% del valor diario</span>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="grid grid-cols-3 gap-4">
          {totals.fiber > 0 && (
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-500 dark:text-gray-400">Fibra</span>
              <span className="block font-semibold text-gray-900 dark:text-white">{totals.fiber.toFixed(1)}g</span>
            </div>
          )}
          
          {totals.sugars > 0 && (
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-500 dark:text-gray-400">Azúcares</span>
              <span className="block font-semibold text-gray-900 dark:text-white">{totals.sugars.toFixed(1)}g</span>
            </div>
          )}
          
          {totals.sodium > 0 && (
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sodio</span>
              <span className="block font-semibold text-gray-900 dark:text-white">{totals.sodium.toFixed(0)}mg</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary;