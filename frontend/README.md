# Bia Energy AI - Frontend Application

Plataforma SaaS MVP de gestión energética y detección de anomalías basada en inteligencia artificial y análisis de telemetría eléctrica.

---

## Stack Tecnológico

* **Framework:** Next.js (App Router)
* **Lenguaje:** TypeScript
* **Librería UI:** React 19
* **Estilos:** Tailwind CSS (Light Theme profesional)
* **Visualización de Datos:** Recharts (Gráficos de series temporales y gráficos circulares de distribución)
* **Autenticación:** Supabase Auth (Inicio de sesión y registro de usuarios)
* **Iconos:** Lucide React

---

## Estructura de Páginas

1. **Panel Principal (Dashboard - `/`)**: 
   * Resumen de la flota de medidores, consumo total, anomalías activas, alta prioridad, confianza IA y último análisis.
   * Gráfico de tendencia de consumo por medidor (con selector de medidor y botón "Ver detalle").
   * Gráfico de distribución del estado de los medidores (Activos, Inactivos, Mantenimiento con botón "Ver listado").
   * Tabla de últimas anomalías detectadas ordenadas por fecha reciente.
2. **Medidores (`/meters`)**:
   * Listado de los medidores con búsqueda en tiempo real y filtrado por estado.
3. **Detalle de Medidor (`/meters/[id]`)**:
   * Estructurado en 5 bloques operacionales: Identidad/Status, Consumo (Actual vs Línea Base con gráfico y selector de período `24h`, `7d`, `14d`), Mediciones Eléctricas (Voltaje, Corriente, Factor de Potencia), Anomalías Asociadas y Eventos Operacionales.
4. **Anomalías IA (`/anomalies`)**:
   * Listado de anomalías e incidentes con filtros avanzados por tipo, severidad y ordenamiento.
5. **Detalle de Anomalía (`/anomalies/[id]`)**:
   * Investigación detallada de anomalías con explicaciones generadas por IA, acciones recomendadas y evidencia estructurada.
6. **Investigación IA (`/analysis`)**:
   * Espacio de trabajo para ejecutar ciclos de análisis de IA (`POST /api/v1/ai/analyze`) con sondeo en tiempo real de estado y visualización de resultados en modal interactivo.
7. **Información (`/information`)**:
   * Especificaciones técnicas de la arquitectura, repositorio, despliegue en Railway, base de datos PostgreSQL, modelo GPT y servicios de autenticación.

---

## Configuración y Variables de Entorno

Cree un archivo `.env.local` en el directorio `frontend/` con las siguientes variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://<your-backend-base-url>
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

4. Compilar para producción:
   ```bash
   npm run build
   ```
