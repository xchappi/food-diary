# Food Diary

Una aplicación web para el seguimiento y registro de hábitos alimenticios. 

## Requisitos

- Node.js (v18.x o superior)
- PNPM (v8.x o superior)
- PostgreSQL (v14.x o superior)

## Configuración

1. Clonar el repositorio
2. Instalar dependencias: `pnpm install`
3. Copiar `.env.example` a `.env` y configurar las variables de entorno
4. Generar el cliente Prisma: `pnpm prisma:generate`
5. Crear la base de datos: `pnpm prisma:push`

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en http://localhost:3000

## Tecnologías principales

- Astro
- React
- Tailwind CSS
- Prisma
- PostgreSQL
- OpenAI

## Licencia

Todos los derechos reservados.
