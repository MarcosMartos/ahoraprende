// src/data/products.ts
import Papa from "papaparse";
import { productosEspeciales } from "./productosEspeciales";

export interface Producto {
  id: string;
  titulo: string;
  precio?: number;
  categoria: string;
  imagen: string;
  marca: string;
}

const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTyAo9GHk2roiKJpE35aAHrfqYSa1LVTeGnKYyO4NFr2b_O3CDtR-PWKaF8OACCoOxnqjWZm1rYcEO9/pub?output=csv";
const IMAGEKIT_BASE_URL =
  "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80";
const IMAGEN_POR_DEFECTO = "https://ik.imagekit.io/puaijw6o8/sin-imagen.webp";

// Convierte un nombre como "AURICULARES JBL WAVE BUDS" a "auriculares-jbl-wave-buds"
function generarSlug(texto: string): string {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita tildes
    .replace(/[^a-z0-9]/g, "-") // Remueve caracteres especiales y deja guiones
    .replace(/-+/g, "-") // Evita guiones dobles
    .replace(/^-|-$/g, ""); // Quita guiones en extremos
}

function obtenerUrlImagen(titulo: string): string {
  if (!titulo) return IMAGEN_POR_DEFECTO;

  const nombreSlug = generarSlug(titulo);

  if (!nombreSlug) return IMAGEN_POR_DEFECTO;

  // 💡 Le agregamos la extensión .webp al final de la URL
  return `${IMAGEKIT_BASE_URL}/${nombreSlug}.webp`;
}

function parsearPrecioArgentino(valor: any): number | undefined {
  if (valor === undefined || valor === null || valor === "") return undefined;
  if (typeof valor === "number") return valor;

  let str = String(valor).trim();
  if (!str) return undefined;

  str = str.replace("$", "").trim();

  if (str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else {
    const partes = str.split(".");
    if (partes.length > 1 && partes[partes.length - 1].length === 3) {
      str = str.replace(/\./g, "");
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
      dynamicTyping: false,
    });

    const productosStock = parsed.data.map((item: any): Producto => {
      const codInterno = item["Cod. producto"] || item["Cód. producto"];
      const codBarra = item["Cód. barra"] || item["Cod. barra"];

      const idProducto =
        (codInterno && String(codInterno).trim()) ||
        (codBarra && String(codBarra).trim()) ||
        "";

      const tituloProducto = item["Nombre*"] || "Producto sin nombre";
      const precioProducto = parsearPrecioArgentino(item["Precio venta"]);
      const categoriaProducto =
        item["Categoría*"] || item["Categoria*"] || "General";
      const marcaProducto =
        item["Subcategoría"] || item["Subcategoria"] || "Varios";

      return {
        id: String(idProducto).trim(),
        titulo: String(tituloProducto).trim(),
        precio: precioProducto,
        categoria: String(categoriaProducto).trim(),
        imagen: obtenerUrlImagen(String(tituloProducto)),
        marca: String(marcaProducto).trim(),
      };
    });

    return [...productosStock, ...productosEspeciales];
  } catch (error) {
    console.error(
      "No se pudo cargar el catálogo dinámico, intentando cargar solo productos locales:",
      error,
    );
    return productosEspeciales;
  }
}
