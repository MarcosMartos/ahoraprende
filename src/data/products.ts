// src/data/products.ts
import Papa from 'papaparse';

export interface Producto {
  id: string;
  titulo: string;
  precio?: number;
  categoria: string;
  imagen: string;
  marca: string;
}

const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTyAo9GHk2roiKJpE35aAHrfqYSa1LVTeGnKYyO4NFr2b_O3CDtR-PWKaF8OACCoOxnqjWZm1rYcEO9/pub?output=csv";
const IMAGEKIT_BASE_URL = "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80";

function obtenerUrlImagen(id: string): string {
  if (!id) return `${IMAGEKIT_BASE_URL}/no-image-placeholder.webp`;
  const nombreArchivo = id.toString().trim().toLowerCase();
  return `${IMAGEKIT_BASE_URL}/${nombreArchivo}.webp`;
}

// Función auxiliar ultra robusta para limpiar precios de Argentina
function parsearPrecioArgentino(valor: any): number | undefined {
  if (valor === undefined || valor === null || valor === "") return undefined;
  
  // Si ya es un número (por si acaso), lo devolvemos redondeado
  if (typeof valor === 'number') return valor;

  let str = String(valor).trim();
  if (!str) return undefined;

  // 1. Quitar el signo de pesos y espacios
  str = str.replace('$', '').trim();

  // Caso A: Si tiene comas y puntos (ej: "1.250.000,45")
  // Caso B: Si tiene solo comas para decimales (ej: "325000,00")
  if (str.includes(',')) {
    // Eliminamos los puntos (que actúan de miles) y cambiamos la coma por punto decimal
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Caso C: Si no tiene comas, pero sí un punto que actúa como miles (ej: "25.000")
    // Ojo: Si el punto está separando tres dígitos al final (ej: "25.000" o "250.000"), en Argentina es miles.
    // Si contiene solo un punto y tiene estructura de miles, removemos el punto.
    const partes = str.split('.');
    if (partes.length > 1 && partes[partes.length - 1].length === 3) {
      str = str.replace(/\./g, '');
    }
  }

  const resultado = parseFloat(str);
  return isNaN(resultado) ? undefined : resultado;
}

export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      throw new Error(`Error al descargar el CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false // 🚨 IMPORTANTE: Lo apagamos para procesar el texto real del Excel sin alteraciones previas
    });

    return parsed.data.map((item: any): Producto => {
  // 1. Lógica de prioridad para el ID:
  // Si tiene "Cod. producto", lo usa. Si no, usa el "Cód. barra". 
  // Si ambos fallan, deja un string vacío.
  const codInterno = item["Cod. producto"] || item["Cód. producto"];
  const codBarra = item["Cód. barra"] || item["Cod. barra"];
  
  const idProducto = (codInterno && String(codInterno).trim()) 
    || (codBarra && String(codBarra).trim()) 
    || "";

  // 2. Tomamos el Título de "Nombre*"
  const tituloProducto = item["Nombre*"] || "Producto sin nombre";

  // 3. Procesamos el "Precio venta"
  const precioProducto = parsearPrecioArgentino(item["Precio venta"]);

  // 4. Tomamos la Categoría de "Categoría*"
  const categoriaProducto = item["Categoría*"] || item["Categoria*"] || "General";

  // 5. Usamos la Subcategoría o "Varios" por defecto
  const marcaProducto = item["Subcategoría"] || item["Subcategoria"] || "Varios";

  return {
    id: String(idProducto).trim(),
    titulo: String(tituloProducto).trim(),
    precio: precioProducto,
    categoria: String(categoriaProducto).trim(),
    // La imagen se buscará usando el ID resuelto arriba (sea interno o de barra)
    imagen: obtenerUrlImagen(String(idProducto)), 
    marca: String(marcaProducto).trim()
  };
});

  } catch (error) {
    console.error("No se pudo cargar el catálogo dinámico:", error);
    return [];
  }
}