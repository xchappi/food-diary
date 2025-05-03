import React from 'react';

interface NutritionalData {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  sugars?: number;
  sodium?: number;
  accuracy?: number;
}

interface NutritionalInfoProps {
  data: NutritionalData;
}

const NutritionalInfo: React.FC<NutritionalInfoProps> = ({ data }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Información nutricional
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Calorías</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(data.calories)} kcal
          </p>
        </div>
        
        <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Proteínas</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(data.proteins)}g
          </p>
        </div>
        
        <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Carbohidratos</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(data.carbohydrates)}g
          </p>
        </div>
        
        <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Grasas</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(data.fats)}g
          </p>
        </div>
      </div>
      
      {data.accuracy && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">Precisión estimada:</span> {data.accuracy}%
        </div>
      )}
    </div>
  );
};

export default NutritionalInfo;