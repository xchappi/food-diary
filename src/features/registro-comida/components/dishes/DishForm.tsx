import React, { useState } from 'react';
import { type Ingredient } from '../ingredients';
import { NutritionalInfo } from '../nutritional';
import DishHeader from './DishHeader';
import DishBasicInfo from './DishBasicInfo';
import DishImageSection from './DishImageSection';
import DishIngredientsSection from './DishIngredientsSection';
import { toast } from 'react-hot-toast';

export interface Dish {
  id?: string;
  name: string;
  description?: string;
  order?: number;
  ingredients?: Ingredient[];
  nutritionalData?: any;
}

interface DishFormProps {
  dish: Dish;
  index: number;
  onChange: (index: number, updatedDish: Dish) => void;
  onRemove: (index: number) => void;
  isEditing?: boolean;
  dragHandleProps?: any; // Para drag & drop
}

/**
 * Componente contenedor para el formulario de plato
 * Maneja la lógica de estado y las llamadas a API
 */
export default function DishForm({ 
  dish, 
  index, 
  onChange, 
  onRemove, 
  isEditing = false,
  dragHandleProps = null
}: DishFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNutritionalData, setShowNutritionalData] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Maneja los cambios en campos básicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedDish = { ...dish, [name]: value };
    onChange(index, updatedDish);
  };

  // Maneja cambios en la imagen (solo una imagen temporal para análisis)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    try {
      // Tomamos solo el primer archivo si hay varios seleccionados
      const file = files[0];
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`La imagen excede el tamaño máximo de 5MB`);
        return;
      }
      
      // Liberar cualquier URL de objeto anterior
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      
      // Crear blob URL para previsualizar la imagen
      const tempUrl = URL.createObjectURL(file);
      
      // Guardar el archivo y la URL
      setImageFile(file);
      setImageSrc(tempUrl);
      
      toast.success('Imagen añadida para análisis');
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  
  // Función para limpiar la imagen temporal
  const clearImage = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageFile(null);
    setImageSrc("");
    toast.success('Imagen eliminada');
  };

  // Manejar añadir un ingrediente al plato
  const handleAddIngredient = (ingredient: Ingredient) => {
    // Verificar si el ingrediente ya existe
    const existingIndex = (dish.ingredients || []).findIndex(
      (ing) => ing.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      toast.error(`El ingrediente "${ingredient.name}" ya existe en este plato`);
      return;
    }
    
    // Asegurarse de que el ingrediente tenga todas las propiedades necesarias
    const completeIngredient = {
      ...ingredient,
      name: ingredient.name.trim(),
      // Asegurarnos de que possibleAllergen sea booleano
      possibleAllergen: !!ingredient.possibleAllergen,
      // Si no es un alérgeno, no necesitamos el tipo
      allergenType: ingredient.possibleAllergen ? ingredient.allergenType : null,
      // Asegurarse de que quantity esté definido
      quantity: ingredient.quantity || null
    };
    
    const updatedIngredients = [...(dish.ingredients || []), completeIngredient];
    const updatedDish = { ...dish, ingredients: updatedIngredients };
    onChange(index, updatedDish);
    toast.success(`Ingrediente "${ingredient.name}" añadido`);
  };

  // Manejar eliminación de un ingrediente
  const handleRemoveIngredient = (ingredientIndex: number) => {
    const ingredientName = dish.ingredients?.[ingredientIndex]?.name || 'Ingrediente';
    const updatedIngredients = (dish.ingredients || []).filter((_, i) => i !== ingredientIndex);
    const updatedDish = { ...dish, ingredients: updatedIngredients };
    onChange(index, updatedDish);
    toast.success(`"${ingredientName}" eliminado`);
  };

  // Analizar imagen con IA
  const analyzeImage = async () => {
    if (!imageFile || !imageSrc) {
      toast.error('Selecciona una imagen para analizar');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Convertir la imagen a base64
      const reader = new FileReader();
        
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        toast.loading('Analizando imagen con IA...', { id: 'analyze-image' });
        
        // Llamar a la API para analizar la imagen
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image: base64Image,
            dishName: dish.name,
            description: dish.description
          }),
        });
        
        if (!response.ok) {
          throw new Error('Error al analizar la imagen');
        }
        
        const data = await response.json();
        
        // Actualizar el plato con los datos recibidos
        const updatedDish = {
          ...dish,
          name: data.dishName || dish.name,
          nutritionalData: data.nutritionalData,
          ingredients: data.ingredients || dish.ingredients
        };
        
        onChange(index, updatedDish);
        setShowNutritionalData(true);
        toast.success('Imagen analizada correctamente', { id: 'analyze-image' });
        setIsLoading(false);
      };
      
      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError('Error al analizar la imagen. Por favor, inténtalo de nuevo.');
      toast.error('Error al analizar la imagen', { id: 'analyze-image' });
      setIsLoading(false);
      console.error('Error analyzing image:', err);
    }
  };

  // Analizar descripción con IA
  const analyzeDescription = async () => {
    if (!dish.description || dish.description.trim() === '') {
      setError('Por favor, ingresa una descripción del plato.');
      toast.error('Ingresa una descripción del plato');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      toast.loading('Analizando descripción...', { id: 'analyze-desc' });
      
      const response = await fetch('/api/analyze-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description: dish.description,
          dishName: dish.name
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al analizar la descripción');
      }
      
      const data = await response.json();
      
      // Actualizar ingredientes con los detectados en la descripción
      if (data.ingredients && Array.isArray(data.ingredients)) {
        const updatedDish = { ...dish, ingredients: data.ingredients };
        onChange(index, updatedDish);
        toast.success('Ingredientes detectados correctamente', { id: 'analyze-desc' });
      } else {
        toast.error('No se detectaron ingredientes', { id: 'analyze-desc' });
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Error al analizar la descripción. Por favor, inténtalo de nuevo.');
      toast.error('Error al analizar la descripción', { id: 'analyze-desc' });
      setIsLoading(false);
      console.error('Error analyzing description:', err);
    }
  };

  // Manejar eliminación de plato con confirmación
  const handleRemovePlato = () => {
    if (window.confirm(`¿Estás seguro de eliminar el plato "${dish.name}"?`)) {
      onRemove(index);
      toast.success(`Plato "${dish.name}" eliminado`);
    }
  };

  // Toggle para expandir/colapsar el plato
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4 transition-all duration-200 hover:shadow-md">
      {/* Header con opciones de arrastrar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            {...dragHandleProps} 
            className="cursor-move p-1 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Arrastrar para reordenar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Plato {index + 1}: {dish.name || 'Sin nombre'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleExpand}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={isExpanded ? "Colapsar plato" : "Expandir plato"}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={handleRemovePlato}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Eliminar plato"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300 mb-4">
          {error}
        </div>
      )}
      
      {isExpanded && (
        <div className="space-y-4">
          {/* Información básica */}
          <DishBasicInfo 
            name={dish.name}
            description={dish.description || ''}
            index={index}
            onChange={handleChange}
            onAnalyzeDescription={analyzeDescription}
            isLoading={isLoading}
          />

          {/* Sección de imágenes */}
          <DishImageSection 
            hasImage={!!imageFile}
            isLoading={isLoading}
            onImageChange={handleImageChange}
            onAnalyzeImage={analyzeImage}
            imageSrc={imageSrc}
          />
      
          {/* Sección de ingredientes */}
          <DishIngredientsSection 
            ingredients={dish.ingredients || []}
            onRemoveIngredient={handleRemoveIngredient}
            onAddIngredient={handleAddIngredient}
          />
      
          {/* Información nutricional */}
          {dish.nutritionalData && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Información Nutricional</h4>
              <NutritionalInfo data={dish.nutritionalData} />
            </div>
          )}
        </div>
      )}
      
      {/* Vista colapsada (cuando isExpanded es false) */}
      {!isExpanded && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <div>
              <p className="font-medium">{dish.name}</p>
              {dish.ingredients && dish.ingredients.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dish.ingredients.length} ingredientes
                </p>
              )}
            </div>
          </div>
          
          {dish.nutritionalData && (
            <div className="flex items-center space-x-4 text-sm">
              <span>{dish.nutritionalData.calories.toFixed(0)} kcal</span>
              <span>{dish.nutritionalData.proteins.toFixed(1)}g prot</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}