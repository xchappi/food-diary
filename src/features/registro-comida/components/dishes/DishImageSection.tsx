import React from 'react';
import { ImageUploader } from '../image-gallery';

interface DishImageSectionProps {
  hasImage: boolean;
  isLoading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyzeImage: () => void;
  imageSrc?: string;
}

/**
 * Componente presentacional para la sección de imágenes de un plato
 * Simplificado para solo mostrar una imagen temporal para análisis (no se almacena)
 */
const DishImageSection: React.FC<DishImageSectionProps> = ({
  hasImage,
  isLoading,
  onImageChange,
  onAnalyzeImage,
  imageSrc
}) => {
  return (
    <div>
      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Imagen para análisis</h4>
      <ImageUploader 
        onImageChange={onImageChange}
        onAnalyzeImage={onAnalyzeImage}
        hasImage={hasImage}
        isLoading={isLoading}
      />
      
      {/* Vista previa de la imagen */}
      {hasImage && imageSrc && (
        <div className="mt-4">
          <div className="relative rounded-md overflow-hidden border-2 border-gray-200 dark:border-gray-700 max-w-xs">
            <img 
              src={imageSrc} 
              alt="Vista previa para análisis" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-0 left-0 bg-primary-500 text-white text-xs px-2 py-1">
              Temporal - Solo para análisis
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Esta imagen no se almacenará, solo se usa para extraer datos del plato.
          </p>
        </div>
      )}
    </div>
  );
};

export default DishImageSection;