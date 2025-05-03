import React from 'react';
import DishDetail from './DishDetail';
import { type Dish } from './dishes';

interface DishesListViewProps {
  dishes: Dish[];
}

const DishesListView: React.FC<DishesListViewProps> = ({ dishes }) => {
  if (!dishes || dishes.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No hay platos registrados para esta comida.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Platos ({dishes.length})
      </h2>
      
      {dishes.map((dish, index) => (
        <DishDetail key={dish.id || index} dish={dish} index={index} />
      ))}
      
      {/* Resumen nutricional de todos los platos */}
      {dishes.some(dish => dish.nutritionalData) && (
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Resumen Nutricional Total
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Calorías</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dishes.reduce((sum, dish) => sum + (dish.nutritionalData?.calories || 0), 0).toFixed(0)} kcal
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Proteínas</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dishes.reduce((sum, dish) => sum + (dish.nutritionalData?.proteins || 0), 0).toFixed(1)}g
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Carbohidratos</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dishes.reduce((sum, dish) => sum + (dish.nutritionalData?.carbohydrates || 0), 0).toFixed(1)}g
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Grasas</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {dishes.reduce((sum, dish) => sum + (dish.nutritionalData?.fats || 0), 0).toFixed(1)}g
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishesListView;