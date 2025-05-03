import React from 'react';

interface ImageUploaderProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyzeImage: () => void;
  hasImage: boolean;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageChange,
  onAnalyzeImage,
  hasImage,
  isLoading
}) => {
  // Referencia al input de archivo para poder resetearlo manualmente si es necesario
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Función para manejar el cambio de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('ImageUploader: Imagen seleccionada');
    
    // Si ya hay una imagen, resetear el input para permitir seleccionar el mismo archivo nuevamente
    if (hasImage && fileInputRef.current) {
      fileInputRef.current.value = '';
      return;
    }
    
    // Llamar a la función de cambio proporcionada por el padre
    onImageChange(e);
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Foto para análisis (no se almacenará)
      </label>
      
      <div className="flex items-center space-x-4">
        <label htmlFor="image" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {hasImage ? 'Cambiar foto' : 'Seleccionar foto'}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
            ref={fileInputRef}
          />
        </label>
        
        {hasImage && !isLoading && (
          <button
            type="button"
            onClick={onAnalyzeImage}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Analizar imagen
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
    </div>
  );
};

export default ImageUploader;