import React, { useState, useEffect } from 'react';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'BRUNCH' | 'SUPPER';

interface Ingredient {
  name: string;
  possibleAllergen: boolean;
  allergenType?: string | null;
  quantity?: string | null;
}

type MealFormProps = {
  initialData?: {
    id?: string;
    date?: string;
    time?: string;
    mealType?: MealType;
    description?: string;
    dishName?: string;
    ingredients?: Ingredient[];
  };
  isEditing?: boolean;
};

export default function MealForm({ initialData = {}, isEditing = false }: MealFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    date: initialData.date || today,
    time: initialData.time || now,
    mealType: initialData.mealType || 'BREAKFAST',
    description: initialData.description || '',
    dishName: initialData.dishName || '',
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData.ingredients || []);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: '',
    possibleAllergen: false,
    allergenType: '',
    quantity: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [showNutritionalData, setShowNutritionalData] = useState(false);
  const [analyzeMethod, setAnalyzeMethod] = useState<'image' | 'description'>('image');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    if (file) {
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar cambios en el nuevo ingrediente
  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    
    setNewIngredient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Añadir un nuevo ingrediente
  const addIngredient = () => {
    if (!newIngredient.name.trim()) return;
    
    setIngredients(prev => [...prev, { ...newIngredient }]);
    setNewIngredient({
      name: '',
      possibleAllergen: false,
      allergenType: '',
      quantity: ''
    });
  };

  // Eliminar un ingrediente
  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Actualizar un ingrediente
  const updateIngredient = (index: number, field: string, value: any) => {
    setIngredients(prev => 
      prev.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };

  const analyzeImage = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        // Call API to analyze image
        const response = await fetch('/api/analyze-image-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            image: base64Image,
            dishName: formData.dishName,
            description: formData.description
          }),
        });
        
        if (!response.ok) {
          throw new Error('Error al analizar la imagen');
        }
        
        const data = await response.json();
        
        // Update form with returned data
        setNutritionalData(data.nutritionalData);
        setFormData(prev => ({
          ...prev,
          dishName: data.dishName || prev.dishName,
        }));
        
        // Actualizar ingredientes con los detectados en la imagen
        if (data.ingredients && Array.isArray(data.ingredients)) {
          setIngredients(data.ingredients);
        }
        
        setShowNutritionalData(true);
        
        setIsLoading(false);
      };
      
      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError('Error al analizar la imagen. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
      console.error('Error analyzing image:', err);
    }
  };

  const analyzeDescription = async () => {
    if (!formData.description.trim()) {
      setError('Por favor, ingresa una descripción de la comida.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to analyze description
      const response = await fetch('/api/analyze-image-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description: formData.description,
          dishName: formData.dishName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al analizar la descripción');
      }
      
      const data = await response.json();
      
      // Actualizar ingredientes con los detectados en la descripción
      if (data.ingredients && Array.isArray(data.ingredients)) {
        setIngredients(data.ingredients);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Error al analizar la descripción. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
      console.error('Error analyzing description:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = isEditing 
        ? `/api/meals/${initialData.id}` 
        : '/api/meals';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        nutritionalData,
        ingredients,
        accuracy: nutritionalData?.accuracy || null
      };
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar la comida');
      }
      
      const data = await response.json();
      
      // Redirect to the meal detail or back to meals list
      window.location.href = isEditing ? `/meals/${data.id}` : '/meals';
    } catch (err) {
      setError('Error al guardar la comida. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
      console.error('Error saving meal:', err);
    }
  };

  // Lista de alérgenos comunes
  const commonAllergens = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'lactosa', label: 'Lactosa' },
    { value: 'frutos_secos', label: 'Frutos secos' },
    { value: 'huevo', label: 'Huevo' },
    { value: 'soja', label: 'Soja' },
    { value: 'pescado', label: 'Pescado' },
    { value: 'mariscos', label: 'Mariscos' },
    { value: 'apio', label: 'Apio' },
    { value: 'mostaza', label: 'Mostaza' },
    { value: 'sésamo', label: 'Sésamo' },
    { value: 'sulfitos', label: 'Sulfitos' },
    { value: 'altramuz', label: 'Altramuz' },
    { value: 'moluscos', label: 'Moluscos' },
    { value: 'ajo', label: 'Ajo' },
    { value: 'cebolla', label: 'Cebolla' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hora
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de comida
        </label>
        <select
          id="mealType"
          name="mealType"
          value={formData.mealType}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="BREAKFAST">Desayuno</option>
          <option value="LUNCH">Almuerzo</option>
          <option value="DINNER">Comida</option>
          <option value="SNACK">Snack</option>
          <option value="BRUNCH">Brunch</option>
          <option value="SUPPER">Cena</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre del plato
        </label>
        <input
          type="text"
          id="dishName"
          name="dishName"
          value={formData.dishName}
          onChange={handleChange}
          placeholder="Ej. Ensalada César"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Describe lo que has comido..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        />
        
        <div className="mt-2">
          <button
            type="button"
            onClick={analyzeDescription}
            disabled={!formData.description.trim() || isLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300"
          >
            {isLoading ? 'Analizando...' : 'Extraer ingredientes de la descripción'}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Foto e ingredientes</h3>
      
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Foto de la comida
          </label>
          
          <div className="flex items-center space-x-4">
            <label htmlFor="image" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Elegir foto
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
            
            {imageFile && !isLoading && (
              <button
                type="button"
                onClick={analyzeImage}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analizar foto
              </button>
            )}
          </div>
          
          {isLoading && (
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analizando...
            </div>
          )}
          
          {imagePreview && (
            <div className="mt-4">
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      
        {/* Sección de ingredientes */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Ingredientes</h4>
          
          {/* Lista de ingredientes */}
          <div className="space-y-3 mb-4">
            {ingredients.length > 0 ? (
              ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 dark:text-white">{ingredient.name}</span>
                      {ingredient.possibleAllergen && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {ingredient.allergenType || 'Posible alérgeno'}
                        </span>
                      )}
                      {ingredient.quantity && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({ingredient.quantity})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No hay ingredientes registrados. Añade ingredientes manualmente o extráelos automáticamente de la foto o descripción.
              </p>
            )}
          </div>
          
          {/* Formulario para añadir ingredientes manualmente */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Añadir ingrediente manualmente</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Nombre del ingrediente"
                  name="name"
                  value={newIngredient.name}
                  onChange={handleIngredientChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Cantidad (opcional)"
                  name="quantity"
                  value={newIngredient.quantity || ''}
                  onChange={handleIngredientChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="possibleAllergen"
                    name="possibleAllergen"
                    checked={newIngredient.possibleAllergen}
                    onChange={handleIngredientChange}
                    className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="possibleAllergen" className="text-sm text-gray-700 dark:text-gray-300">
                    Es alérgeno
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-1">
                {newIngredient.possibleAllergen && (
                  <select
                    name="allergenType"
                    value={newIngredient.allergenType || ''}
                    onChange={handleIngredientChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Seleccionar tipo</option>
                    {commonAllergens.map(allergen => (
                      <option key={allergen.value} value={allergen.value}>
                        {allergen.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {!newIngredient.possibleAllergen && (
                  <button
                    type="button"
                    onClick={addIngredient}
                    disabled={!newIngredient.name}
                    className="w-full px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Añadir
                  </button>
                )}
              </div>
              
              {newIngredient.possibleAllergen && (
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={addIngredient}
                    disabled={!newIngredient.name}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Añadir ingrediente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Información nutricional */}
      {showNutritionalData && nutritionalData && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información nutricional</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Calorías</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(nutritionalData.calories)} kcal
              </p>
            </div>
            
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Proteínas</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(nutritionalData.proteins)}g
              </p>
            </div>
            
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Carbohidratos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(nutritionalData.carbohydrates)}g
              </p>
            </div>
            
            <div className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Grasas</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(nutritionalData.fats)}g
              </p>
            </div>
          </div>
          
          {nutritionalData.accuracy && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Precisión estimada:</span> {nutritionalData.accuracy}%
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <a
          href={isEditing ? `/meals/${initialData.id}` : '/meals'}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancelar
        </a>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            'Guardar'
          )}
        </button>
      </div>
    </form>
  );
}