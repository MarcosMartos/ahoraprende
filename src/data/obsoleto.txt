export interface Producto {
  id: string;
  titulo: string;
  precio?: number;
  categoria: string;
  imagen: string;
  marca: string;
}

export const productosDestacados: Producto[] = [
  {
    id: "1",
    titulo: "JS 538",
    precio: 850000,
    categoria: "Auriculares",
    // Optimización: Ancho de 600px, formato automático, calidad 80%
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/js538_auris.webp",
    marca: "js380",
  },
  {
    id: "2",
    titulo: "Jbl Wave 380",
    precio: 45000,
    categoria: "Auriculares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/jbl_wave380_1.webp",
    marca: "jbl",
  },
  {
    id: "3",
    titulo: "Parlante Go 3",
    precio: 38000,
    categoria: "Parlantes",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/jbl_go3_parlante.webp",
    marca: "jbl",
  },
  {
    id: "4",
    titulo: "Microfono corbatero x2",
    precio: 1200000,
    categoria: "Microfonos",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/furry_soul_microfonos.webp",
    marca: "Soul",
  },
  {
    id: "5",
    titulo: "Redmi Buds 6 Play",
    precio: 1200000,
    categoria: "Auriculares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/redmi_buds6_auris.webp",
    marca: "REDMI",
  },
  {
    id: "6",
    titulo: "Iphone 17 Pro Max",
    categoria: "Celulares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph17promax.webp",
    marca: "APPLE",
  },
  {
    id: "7",
    titulo: "Iphone 17 Pro",
    categoria: "Celulares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph17pro.webp",
    marca: "APPLE",
  },
  {
    id: "8",
    titulo: "Iphone 17",
    categoria: "Celulares",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph17.webp",
    marca: "APPLE",
  },
  {
    id: "9",
    titulo: "Iphone 16 Pro Max",
    categoria: "Celulares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph16promax.webp",
    marca: "APPLE",
  },
  {
    id: "10",
    titulo: "Iphone 16 Pro",
    categoria: "Celulares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph16pro.webp",
    marca: "APPLE",
  },
  {
    id: "11",
    titulo: "Iphone 16",
    categoria: "Celulares",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph16.webp",
    marca: "APPLE",
  },
  {
    id: "12",
    titulo: "Iphone 15 Pro",
    categoria: "Celulares",
    imagen:
      "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph15pro.webp",
    marca: "APPLE",
  },
  {
    id: "13",
    titulo: "Iphone 15",
    categoria: "Celulares",
    imagen: "https://ik.imagekit.io/puaijw6o8/tr:w-600,f-auto,q-80/iph15.webp",
    marca: "APPLE",
  },
];
