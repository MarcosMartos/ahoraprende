export interface Producto {
  id: string;
  titulo: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: number;
  marca: string;
}

export const productosDestacados: Producto[] = [
  {
    id: "1",
    titulo: "JS 538",
    precio: 850000,
    categoria: "Auriculares",
    // Optimización: Ancho de 600px, formato automático, calidad 80%
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/js538_auris.webp",
    stock: 2,
    marca: "js380",
  },
  {
    id: "2",
    titulo: "Jbl Wave 380",
    precio: 45000,
    categoria: "Auriculares",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/jbl_wave380_1.webp",
    stock: 15,
    marca: "jbl",
  },
  {
    id: "3",
    titulo: "Parlante Go 3",
    precio: 38000,
    categoria: "Parlantes",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/jbl_go3_parlante.webp",
    stock: 5,
    marca: "jbl",
  },
  {
    id: "4",
    titulo: "Microfono corbatero x2",
    precio: 1200000,
    categoria: "Microfonos",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/furry_soul_microfonos.webp",
    stock: 1,
    marca: "Soul",
  },
  {
    id: "5",
    titulo: "Redmi Buds 6 Play",
    precio: 1200000,
    categoria: "Auriculares",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/redmi_buds6_auris.webp",
    stock: 1,
    marca: "Redmi",
  },
];