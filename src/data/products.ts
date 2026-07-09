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
    imagen: "../public/js538_auris.webp",
    stock: 2,
    marca: "js380"
  },
  {
    id: "2",
    titulo: "Jbl Wave 380",
    precio: 45000,
    categoria: "Auriculares",
    imagen: "../public/jbl_wave380.webp",
    stock: 15,
    marca: "jbl"
  },
  {
    id: "3",
    titulo: "Parlante Go 3",
    precio: 38000,
    categoria: "Parlantes",
    imagen: "../public/jbl_go3_parlante.webp",
    stock: 5,
    marca: "jbl"
  },
  {
    id: "4",
    titulo: "Microfono corbatero x2",
    precio: 1200000,
    categoria: "Microfonos",
    imagen: "../public/furry_soul_microfonos.webp",
    stock: 1,
    marca: "Soul"
  },
  {
    id: "5",
    titulo: "Redmi Buds 6 Play",
    precio: 1200000,
    categoria: "Auriculares",
    imagen: "../public/redmi_buds6_auris.webp",
    stock: 1,
    marca: "Redmi"
  }
  // Puedes repetir o agregar los demás aquí...
];