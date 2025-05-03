import React, { useState, useEffect } from 'react';
import { MealImageGallery, ImageUploader, type MealImage } from './image-gallery';
import { IngredientsList, AddIngredientForm, type Ingredient } from './ingredients';
import { NutritionalInfo } from './nutritional';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'BRUNCH' | 'SUPPER';

type MealFormProps = {
  initialData?: {
    id?: string;
    date?: string;
    time?: string;
    mealType?: MealType;
    description?: string;
    dishName?: string;
    ingredients?: Ingredient[];
    images?: MealImage[];
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealImages, setMealImages] = useState<MealImage[]>(initialData.images || []);
  const [mainImageIndex, setMainImageIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [showNutritionalData, setShowNutritionalData] = useState(false);
  const [analyzeMethod, setAnalyzeMethod] = useState<'image' | 'description'>('image');

  // Inicializar mainImageIndex si hay imágenes existentes
  useEffect(() => {
    if (mealImages.length > 0) {
      const mainIndex = mealImages.findIndex(img => img.isMain);
      setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('======= INICIO DE SELECCIÓN DE IMÁGENES =======');
    const files = e.target.files;
    console.log('Files selected:', files ? files.length : 0);
    
    if (!files || files.length === 0) {
      console.log('No se seleccionaron archivos');
      return;
    }
    
    try {
      // Crear un array a partir de FileList
      const newFiles = Array.from(files);
      console.log('Archivos seleccionados:', newFiles.map(f => `${f.name} (${f.size} bytes)`));
      
      // Creamos copias de los estados actuales para trabajar con ellos
      const currentImageFiles = [...imageFiles];
      const currentMealImages = [...mealImages];
      
      // Array para las nuevas imágenes temporales
      const newTempImages: MealImage[] = [];
      
      // Procesar cada archivo
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        try {
          // Crear blob URL para previsualizar la imagen
          const tempUrl = URL.createObjectURL(file);
          console.log(`Creada URL temporal para ${file.name}:`, tempUrl);
          
          // Añadir a las imágenes temporales
          const isFirstImage = currentMealImages.length === 0 && newTempImages.length === 0;
          newTempImages.push({
            imageUrl: tempUrl,
            isMain: isFirstImage, // La primera imagen se marca como principal si no hay otras
            order: currentMealImages.length + i
          });
          
          // Añadir el archivo a la lista de archivos
          currentImageFiles.push(file);
        } catch (error) {
          console.error(`Error al procesar el archivo ${file.name}:`, error);
        }
      }
      
      console.log('Nuevas imágenes temporales:', newTempImages);
      
      // Actualizar el estado de los archivos
      setImageFiles(currentImageFiles);
      console.log('Estado de imageFiles actualizado:', currentImageFiles.length, 'archivos');
      
      // Actualizar el estado de las imágenes
      const updatedMealImages = [...currentMealImages, ...newTempImages];
      setMealImages(updatedMealImages);
      console.log('Estado de mealImages actualizado:', updatedMealImages.length, 'imágenes');
      
      // Establecer la primera imagen como principal si es necesario
      if (mainImageIndex === -1 && updatedMealImages.length > 0) {
        setMainImageIndex(0);
        console.log('Establecida primera imagen como principal');
      }
      
      // Crear vista previa general si es necesario
      if (!imagePreview && newFiles.length > 0) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImagePreview(result);
          console.log('Vista previa general creada');
        };
        reader.readAsDataURL(newFiles[0]);
      }
      
      console.log('Proceso de selección de imágenes completado con éxito');
    } catch (error) {
      console.error('Error global al procesar las imágenes:', error);
    } finally {
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      // Hacemos esto al final para asegurar que funcione incluso si hay errores
      if (e.target) {
        e.target.value = '';
        console.log('Input de archivo limpiado');
      }
    }
    console.log('======= FIN DE SELECCIÓN DE IMÁGENES =======');
  };
  
  // Función para establecer una imagen como principal
  const setAsMainImage = (index: number) => {
    setMealImages(prev => 
      prev.map((img, i) => ({
        ...img,
        isMain: i === index
      }))
    );
    setMainImageIndex(index);
  };
  
  // Función para eliminar una imagen
  const removeImage = (index: number) => {
    // Si era la imagen principal y hay otras imágenes, establecer la primera como principal
    if (index === mainImageIndex && mealImages.length > 1) {
      const newMainIndex = index === 0 ? 1 : 0;
      setMainImageIndex(newMainIndex);
    } else if (index < mainImageIndex) {
      // Ajustar el índice principal si eliminamos una imagen antes
      setMainImageIndex(mainImageIndex - 1);
    } else if (mealImages.length === 1) {
      // Si era la única imagen
      setMainImageIndex(-1);
    }
    
    // Eliminar la imagen de la lista
    setMealImages(prev => prev.filter((_, i) => i !== index));
    
    // Si estamos en modo edición y la imagen tiene ID, debería enviarse una solicitud para eliminarla del servidor
    // Lo implementaremos en el manejo del submit
  };
  
  // Función para reordenar imágenes (mover hacia arriba)
  const moveImageUp = (index: number) => {
    if (index === 0) return; // Ya está en la parte superior
    
    setMealImages(prev => {
      const newImages = [...prev];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      
      // Actualizar órdenes
      return newImages.map((img, i) => ({
        ...img,
        order: i
      }));
    });
    
    // Actualizar índice de imagen principal si es necesario
    if (index === mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    } else if (index - 1 === mainImageIndex) {
      setMainImageIndex(mainImageIndex + 1);
    }
  };
  
  // Función para reordenar imágenes (mover hacia abajo)
  const moveImageDown = (index: number) => {
    if (index === mealImages.length - 1) return; // Ya está en la parte inferior
    
    setMealImages(prev => {
      const newImages = [...prev];
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
      
      // Actualizar órdenes
      return newImages.map((img, i) => ({
        ...img,
        order: i
      }));
    });
    
    // Actualizar índice de imagen principal si es necesario
    if (index === mainImageIndex) {
      setMainImageIndex(mainImageIndex + 1);
    } else if (index + 1 === mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
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

  const analyzeImage = async () => {
    // Usamos la imagen principal para el análisis
    if (mealImages.length === 0 || mainImageIndex === -1) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Si es una imagen temporal (File), convertirla a base64
      if (imageFiles.length > 0 && mainImageIndex < imageFiles.length) {
        const file = imageFiles[mainImageIndex];
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Image = (reader.result as string).split(',')[1];
          
          // Call API to analyze image
          const response = await fetch('/api/analyze-image', {
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
        
        reader.readAsDataURL(file);
      } else {
        // Si es una imagen ya existente, usamos su URL para el análisis
        // Aquí deberíamos tener una API que acepte una URL en lugar de un base64
        // Por ahora, mostramos un error
        setError('Para analizar una imagen ya guardada, por favor póngase en contacto con soporte.');
        setIsLoading(false);
      }
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
      const response = await fetch('/api/analyze-image', {
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
      console.log('================= INICIO DE ENVÍO DE FORMULARIO =================');
      console.log('Estado imageFiles:', imageFiles.length, 'archivos');
      console.log('Estado mealImages:', mealImages.length, 'imágenes');
      
      // Validaciones previas
      if (imageFiles.length > 0 && mealImages.filter(img => img.imageUrl.startsWith('blob:')).length === 0) {
        console.warn('ADVERTENCIA: Hay archivos de imagen pero no hay URLs blob en mealImages');
      }
      
      const endpoint = isEditing 
        ? `/api/meals/${initialData.id}` 
        : '/api/meals';
      
      const method = isEditing ? 'PUT' : 'POST';
      console.log(`Método de envío: ${method} a ${endpoint}`);
      
      // Primero, subimos las nuevas imágenes si hay alguna
      let uploadedImageUrls: Array<{id: string, imageUrl: string, isMain: boolean, order: number}> = [];
      
      if (imageFiles.length > 0) {
        console.log('\n>>>>> FASE 1: CARGA DE IMÁGENES <<<<<');
        console.log(`Procesando ${imageFiles.length} archivos de imagen para subir`);
        
        try {
          // Crear un nuevo FormData
          const formDataUpload = new FormData();
          
          // Mapear archivos con imágenes temporales (buscar correspondencia por índice)
          const blobImages = mealImages.filter(img => img.imageUrl && img.imageUrl.startsWith('blob:'));
          console.log(`Imágenes temporales (blob): ${blobImages.length}`);
          
          if (blobImages.length !== imageFiles.length) {
            console.warn('ADVERTENCIA: Número de archivos e imágenes blob no coincide');
          }
          
          // Agregar cada archivo al FormData con sus metadatos
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            console.log(`Procesando archivo ${i+1}/${imageFiles.length}: ${file.name} (${file.size} bytes)`);
            
            // Buscar la correspondencia en blobImages
            const matchedImage = i < blobImages.length ? blobImages[i] : null;
            
            if (matchedImage) {
              console.log(`Correspondencia encontrada. isMain=${matchedImage.isMain}, order=${matchedImage.order}`);
              formDataUpload.append('images', file);
              formDataUpload.append('isMain', matchedImage.isMain ? 'true' : 'false');
              formDataUpload.append('order', matchedImage.order.toString());
            } else {
              console.log('No se encontró correspondencia, usando valores predeterminados');
              formDataUpload.append('images', file);
              formDataUpload.append('isMain', (i === 0 && mealImages.length === 0) ? 'true' : 'false');
              formDataUpload.append('order', i.toString());
            }
          }
          
          // Si estamos editando, incluir el ID de la comida
          if (isEditing && initialData.id) {
            formDataUpload.append('mealId', initialData.id);
            console.log('Añadido mealId para edición:', initialData.id);
          }
          
          // Enviar imágenes al servidor
          console.log('Enviando imágenes al servidor...');
          const imageUploadResponse = await fetch('/api/meals/images', {
            method: 'POST',
            body: formDataUpload,
          });
          
          console.log(`Respuesta recibida: ${imageUploadResponse.status} ${imageUploadResponse.statusText}`);
          
          if (!imageUploadResponse.ok) {
            const errorText = await imageUploadResponse.text();
            console.error('Error al subir imágenes:', errorText);
            throw new Error(`Error al subir las imágenes: ${errorText}`);
          }
          
          const imageData = await imageUploadResponse.json();
          console.log('Datos de imágenes recibidos:', imageData);
          uploadedImageUrls = imageData.images;
          console.log(`Se subieron ${uploadedImageUrls.length} imágenes exitosamente`);
        } catch (uploadError) {
          console.error('Error en la fase de carga de imágenes:', uploadError);
          throw new Error(`Error en la carga de imágenes: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`);
        }
      } else {
        console.log('No hay nuevas imágenes para subir');
      }
      
      console.log('\n>>>>> FASE 2: GUARDAR DATOS DE COMIDA <<<<<');
      
      // Filtrar mealImages para excluir las URLs de blob y quedarnos solo con imágenes persistentes
      const persistentImages = mealImages.filter(img => img.id && !img.imageUrl.startsWith('blob:'));
      console.log(`Imágenes persistentes (existentes): ${persistentImages.length}`);
      
      // Preparar el payload para guardar la comida
      const allImages = [
        // Imágenes existentes (si estamos editando)
        ...persistentImages.map(img => ({
          id: img.id,
          isMain: img.isMain,
          order: img.order
        })),
        // Referencias a las nuevas imágenes subidas
        ...uploadedImageUrls
      ];

      console.log(`Total de imágenes en el payload: ${allImages.length}`);
      
      // Verificar que haya al menos una imagen principal
      const hasMainImage = allImages.some(img => img.isMain);
      if (!hasMainImage && allImages.length > 0) {
        console.log('No se encontró ninguna imagen principal. Estableciendo la primera como principal.');
        allImages[0].isMain = true;
      }
      
      // Construir el payload completo
      const payload = {
        ...formData,
        nutritionalData,
        ingredients,
        accuracy: nutritionalData?.accuracy || null,
        images: allImages,
        // Añadir la información del plato principal
        dishes: [
          {
            name: formData.dishName || 'Plato principal',
            order: 0,
            isMain: true
          }
        ]
      };
      
      // Enviar datos al servidor
      console.log('Enviando datos de comida al servidor...');
      console.log('Payload de imágenes:', payload.images);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log(`Respuesta recibida: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al guardar la comida:', errorText);
        throw new Error(`Error al guardar la comida: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Datos de comida guardados:', data);
      
      // Redirigir a la página de detalle de la comida
      const redirectUrl = `/meals/${data.id}`;
      console.log(`Redirigiendo a: ${redirectUrl}`);
      window.location.href = redirectUrl;
      
      console.log('================= FIN DE ENVÍO DE FORMULARIO =================');
    } catch (err) {
      console.error('Error en el proceso de guardado:', err);
      setError(`Error al guardar la comida: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setIsLoading(false);
    }
  };

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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fotos e ingredientes</h3>
      
        {/* Sección de fotos */}
        <ImageUploader 
          onImageChange={handleImageChange}
          onAnalyzeImage={analyzeImage}
          hasImages={mealImages.length > 0}
          isLoading={isLoading}
        />
        
        {/* Galería de imágenes */}
        <MealImageGallery 
          images={mealImages}
          mainImageIndex={mainImageIndex}
          onSetMainImage={setAsMainImage}
          onMoveImageUp={moveImageUp}
          onMoveImageDown={moveImageDown}
          onRemoveImage={removeImage}
        />
      
        {/* Sección de ingredientes */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Ingredientes</h4>
          
          {/* Lista de ingredientes */}
          <div className="mb-4">
            <IngredientsList 
              ingredients={ingredients}
              onRemoveIngredient={removeIngredient}
            />
          </div>
          
          {/* Formulario para añadir ingredientes manualmente */}
          <AddIngredientForm 
            newIngredient={newIngredient}
            onChange={handleIngredientChange}
            onAddIngredient={addIngredient}
          />
        </div>
      </div>
      
      {/* Información nutricional */}
      {showNutritionalData && nutritionalData && (
        <NutritionalInfo data={nutritionalData} />
      )}
      
      <div className="flex justify-end space-x-3">
        <a
          href={isEditing ? `/meals/${initialData.id}` : '/dashboard'}
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