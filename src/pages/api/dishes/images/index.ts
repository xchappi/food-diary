import type { APIRoute } from 'astro';
import { protectAPI } from '../../../../utils/auth';

// Simulación - esta función debería manejar la subida real de archivos a un servicio como S3
async function uploadImagesToStorage(files: File[]): Promise<string[]> {
  // En una implementación real, aquí subirías los archivos a tu servicio de almacenamiento
  // Por ahora, simulamos URLs para desarrollo local
  return files.map((file, index) => 
    `https://storage.example.com/food-diary/dishes/${Date.now()}-${index}-${file.name}`
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) return authResult;
    
    // Verificar si es multipart/form-data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ message: 'Formato de datos inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Procesar el FormData
    const formData = await request.formData();
    
    // Extraer archivos de imágenes
    const imageFiles: File[] = [];
    const metadata: { isMain: boolean, order: number }[] = [];
    
    // Extraer el dishId si está presente (para edición)
    const dishId = formData.get('dishId')?.toString();
    
    // Procesar cada conjunto de archivos e información
    let imageIndex = 0;
    
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        imageFiles.push(value);
        
        // Buscar los metadatos correspondientes
        const isMainValue = formData.getAll('isMain')[imageIndex];
        const orderValue = formData.getAll('order')[imageIndex];
        
        const isMain = isMainValue === 'true';
        const order = parseInt(orderValue?.toString() || '0');
        
        metadata.push({ isMain, order });
        imageIndex++;
      }
    }
    
    if (imageFiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No se proporcionaron imágenes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Subir imágenes al almacenamiento
    const uploadedUrls = await uploadImagesToStorage(imageFiles);
    
    // Crear respuesta con información de las imágenes subidas
    const images = uploadedUrls.map((url, i) => ({
      id: `temp-${Date.now()}-${i}`, // En implementación real, este ID vendría de la base de datos
      imageUrl: url,
      isMain: metadata[i].isMain,
      order: metadata[i].order
    }));
    
    return new Response(
      JSON.stringify({
        message: 'Imágenes subidas exitosamente',
        images
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading images:', error);
    return new Response(
      JSON.stringify({ message: 'Error al subir imágenes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};