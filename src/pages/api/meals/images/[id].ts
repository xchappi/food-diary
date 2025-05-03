import type { APIRoute } from 'astro';
import { protectAPI } from '../../../../utils/auth';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Convertir funciones de fs en promesas
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

// Directorio base para almacenar las imágenes temporales
const UPLOAD_DIR = path.join(process.cwd(), 'public');

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    // Proteger endpoint - solo usuarios autenticados pueden acceder
    const authResult = await protectAPI(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Recibir la ruta relativa de la imagen temporal
    const data = await request.json();
    const imagePath = data.imagePath;
    
    if (!imagePath) {
      return new Response(
        JSON.stringify({ message: 'Ruta de imagen no proporcionada' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar que la imagen pertenece al usuario (está en su directorio)
    const userPrefix = `/uploads/temp/${user.id}/`;
    if (!imagePath.startsWith(userPrefix)) {
      return new Response(
        JSON.stringify({ message: 'Imagen no pertenece al usuario actual' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Obtener la ruta completa del archivo
    const filePath = path.join(UPLOAD_DIR, imagePath);
    
    // Eliminar el archivo si existe
    if (await exists(filePath)) {
      await unlink(filePath);
      return new Response(
        JSON.stringify({ message: 'Imagen temporal eliminada exitosamente' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ message: 'Archivo no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error al eliminar imagen temporal:', error);
    return new Response(
      JSON.stringify({ message: 'Error al eliminar la imagen temporal' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};