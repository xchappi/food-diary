import type { APIRoute } from 'astro';
import { protectAPI } from '../../../../utils/auth';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';

// Convertir funciones de fs en promesas
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Directorio para almacenar las imágenes temporalmente para análisis
const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'temp');

// Asegurar que el directorio existe
const ensureDir = async (dir: string) => {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw err;
    }
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('API: Solicitud de subida de imágenes recibida para análisis');
    
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) {
      console.log('API: Error de autenticación');
      return authResult;
    }
    
    const { user } = authResult;
    console.log('API: Usuario autenticado:', user.id);
    
    // Verificar si es multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    console.log('API: Content-Type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      console.log('API: Error, no es multipart/form-data');
      return new Response(
        JSON.stringify({ message: 'Se esperaba content-type: multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parsear form data
    console.log('API: Parseando FormData...');
    const formData = await request.formData();
    
    // Obtener todos los nombres de campo en el FormData
    const fieldNames = Array.from(formData.keys());
    console.log('API: Campos recibidos en FormData:', fieldNames);
    
    const images = formData.getAll('images') as File[];
    console.log('API: Imágenes recibidas:', images.length);
    
    // Verificar que hay imágenes
    if (images.length === 0) {
      console.log('API: Error, no hay imágenes en la solicitud');
      return new Response(
        JSON.stringify({ message: 'No se han proporcionado imágenes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Asegurar que el directorio de imágenes temporales existe
    const userTempDir = path.join(TEMP_UPLOAD_DIR, user.id);
    console.log('API: Directorio de subida temporal:', userTempDir);
    await ensureDir(userTempDir);
    console.log('API: Directorio creado/verificado');
    
    // Procesar y guardar cada imagen temporalmente para análisis
    console.log('API: Procesando imágenes...');
    const tempImages = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      console.log(`API: Procesando imagen ${i+1}/${images.length}: ${file.name || 'sin nombre'}`);
      
      // Generar nombre de archivo único temporal
      const randomName = crypto.randomBytes(16).toString('hex');
      const fileExt = path.extname(file.name || '.jpg'); // Usar .jpg por defecto si no hay nombre
      const fileName = `${randomName}${fileExt}`;
      const filePath = path.join(userTempDir, fileName);
      console.log(`API: Nombre de archivo temporal generado: ${fileName}`);
      
      try {
        // Guardar el archivo temporalmente
        console.log('API: Leyendo datos del archivo...');
        const arrayBuffer = await file.arrayBuffer();
        console.log(`API: Tamaño del archivo: ${arrayBuffer.byteLength} bytes`);
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`API: Guardando archivo en: ${filePath}`);
        await writeFile(filePath, buffer);
        console.log('API: Archivo guardado exitosamente');
        
        // Ruta relativa para acceder desde el frontend
        const relativePath = `/uploads/temp/${user.id}/${fileName}`;
        console.log('API: Ruta relativa:', relativePath);
        
        // Almacenar información temporal para anlisis
        tempImages.push({
          imageUrl: relativePath,
          order: i
        });
      } catch (error) {
        console.error(`API: Error al procesar la imagen ${i}:`, error);
        // Continuar con la siguiente imagen en lugar de fallar toda la operación
      }
    }
    
    console.log(`API: Proceso completado. ${tempImages.length} imágenes temporales guardadas para análisis`);
    
    // Nota: estos archivos podrían eliminarse automáticamente después de un tiempo
    // o mediante un cron job ya que son solo para análisis
    
    console.log('API: Enviando respuesta exitosa con', tempImages.length, 'imágenes temporales');
    return new Response(
      JSON.stringify({ 
        message: 'Imágenes subidas exitosamente para análisis',
        images: tempImages
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('API: Error general al procesar la solicitud:', error);
    
    // Proporcionar un mensaje de error más descriptivo si es posible
    let errorMessage = 'Error al subir las imágenes para análisis';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error('API: Detalles del error:', error.stack);
    }
    
    // Registrar información adicional que pueda ser útil para depuración
    console.error('API: Contexto de la solicitud:', {
      contentType: request.headers.get('content-type'),
      method: request.method,
      url: request.url
    });
    
    return new Response(
      JSON.stringify({ message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};