// src/scripts/cartStore.js

let carrito = [];
const WHATSAPP_NUMBER = "5492604202201";

// Variables globales para los elementos del DOM
let cartCountEl, cartBtn, cartSidebar, cartOverlay, closeCartBtn;
let cartItemsContainer, cartTotalPriceEl, whatsappCheckoutBtn;
let modal,
  closeModalBtn,
  modalAddBtn,
  currentActiveProductId = null;

// Variables globales para la paginación y el buscador
let btnPrevPage, btnNextPage, currentPageNumEl, searchInputEl;
let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 12;

// Inicialización controlada una vez que el DOM está 100% listo
function inicializarTienda() {
  cartCountEl = document.getElementById("cart-count");
  cartBtn = document.getElementById("cart-btn");
  cartSidebar = document.getElementById("cart-sidebar");
  cartOverlay = document.getElementById("cart-overlay");
  closeCartBtn = document.getElementById("close-cart");
  cartItemsContainer = document.getElementById("cart-items-container");
  cartTotalPriceEl = document.getElementById("cart-total-price");
  whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");
  modal = document.getElementById("product-modal");
  closeModalBtn = document.getElementById("close-modal");
  modalAddBtn = document.getElementById("modal-add-btn");

  // Elementos de la paginación
  btnPrevPage = document.getElementById("btn-prev-page");
  btnNextPage = document.getElementById("btn-next-page");
  currentPageNumEl = document.getElementById("current-page-num");

  // Elemento del buscador
  searchInputEl = document.getElementById("product-search");

  if (cartBtn) cartBtn.addEventListener("click", abrirCarrito);
  if (closeCartBtn) closeCartBtn.addEventListener("click", cerrarCarrito);
  if (cartOverlay) cartOverlay.addEventListener("click", cerrarCarrito);
  if (closeModalBtn) closeModalBtn.addEventListener("click", cerrarModal);

  if (btnPrevPage)
    btnPrevPage.addEventListener("click", () => cambiarPagina(-1));
  if (btnNextPage)
    btnNextPage.addEventListener("click", () => cambiarPagina(1));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) cerrarModal();
    });
  }

  if (whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener("click", enviarPedidoWhatsApp);
  }

  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", agregarDesdeModal);
  }

  // Evento para capturar lo que se escribe en el buscador
  if (searchInputEl) {
    searchInputEl.addEventListener("input", () => {
      paginaActual = 1; // Reseteamos a la página 1 en cada búsqueda
      actualizarPaginacion();
    });
  }

  configurarFiltros();
  configurarTarjetasProductos();
  actualizarUI();

  // Al iniciar la tienda, actualizarPaginacion leerá automáticamente
  // que el botón de "Celulares" tiene la clase 'bg-blue-600' y filtrará de inmediato.
  actualizarPaginacion();
}

function abrirCarrito() {
  if (!cartSidebar || !cartOverlay) return;
  cartSidebar.classList.remove("invisible");
  cartOverlay.classList.remove("opacity-0");
  const innerSidebar = cartSidebar.querySelector(".absolute.right-0");
  if (innerSidebar) innerSidebar.classList.remove("translate-x-full");
  document.body.classList.add("overflow-hidden");
}

function cerrarCarrito() {
  if (!cartSidebar || !cartOverlay) return;
  cartOverlay.classList.add("opacity-0");
  const innerSidebar = cartSidebar.querySelector(".absolute.right-0");
  // CORRECCIÓN: Para ocultar el sidebar deslizándose, debemos VOLVER a agregar 'translate-x-full'
  if (innerSidebar) innerSidebar.classList.add("translate-x-full");
  setTimeout(() => {
    cartSidebar.classList.add("invisible");
    document.body.classList.remove("overflow-hidden");
  }, 300);
}

function actualizarUI() {
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  if (cartCountEl) cartCountEl.textContent = totalItems.toString();
  if (!cartItemsContainer || !cartTotalPriceEl) return;

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 my-auto">
        <span class="text-4xl mb-2">🛍️</span>
        <p class="text-sm font-medium">El carrito está vacío</p>
      </div>
    `;
    cartTotalPriceEl.textContent = "$0";
    return;
  }

  let total = 0;
  let htmlContenido = "";

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;

    const precioRenderizado =
      item.precio > 0
        ? `$${(item.precio * item.cantidad).toLocaleString("es-AR")}`
        : `<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Consultar</span>`;

    htmlContenido += `
      <div class="flex gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 items-center justify-between">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <img src="${item.imagen}" alt="${item.titulo}" class="w-11 h-11 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800" loading="lazy" />
          <div class="min-w-0 flex-1">
            <h4 class="text-slate-200 text-xs font-medium truncate">${item.titulo}</h4>
            <div class="mt-0.5">${precioRenderizado}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-2">
          <div class="flex items-center bg-slate-900 rounded-lg border border-slate-800 overflow-hidden text-xs">
            <button class="btn-qty-minus px-2 py-1 text-slate-400 hover:text-white font-bold" data-id="${item.id}">-</button>
            <span class="px-1 text-slate-200 font-bold min-w-[16px] text-center">${item.cantidad}</span>
            <button class="btn-qty-plus px-2 py-1 text-slate-400 hover:text-white font-bold" data-id="${item.id}">+</button>
          </div>
          <button class="btn-remove text-slate-500 hover:text-red-400 p-1 text-sm" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = htmlContenido;
  cartTotalPriceEl.textContent = `$${total.toLocaleString("es-AR")}`;

  cartItemsContainer
    .querySelectorAll(".btn-qty-plus")
    .forEach((btn) =>
      btn.addEventListener("click", () => modificarCantidad(btn.dataset.id, 1)),
    );
  cartItemsContainer
    .querySelectorAll(".btn-qty-minus")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        modificarCantidad(btn.dataset.id, -1),
      ),
    );
  cartItemsContainer
    .querySelectorAll(".btn-remove")
    .forEach((btn) =>
      btn.addEventListener("click", () => eliminarDelCarrito(btn.dataset.id)),
    );
}

function agregarAlCarrito(id, titulo, precio, imagen) {
  const itemExistente = carrito.find((item) => item.id === id);
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ id, titulo, precio, imagen, cantidad: 1 });
  }
  actualizarUI();
  abrirCarrito();
}

function modificarCantidad(id, cambio) {
  const item = carrito.find((item) => item.id === id);
  if (!item) return;
  item.cantidad += cambio;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(id);
  } else {
    actualizarUI();
  }
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter((item) => item.id !== id);
  actualizarUI();
}

function enviarPedidoWhatsApp() {
  if (carrito.length === 0) return;
  let mensaje = "¡Hola! Me gustaría encargar:\n\n";
  let total = 0;
  let tieneProductosBajoConsulta = false;

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;
    if (item.precio > 0) {
      mensaje += `• ${item.cantidad}x ${item.titulo} ($${(item.precio * item.cantidad).toLocaleString("es-AR")})\n`;
    } else {
      tieneProductosBajoConsulta = true;
      mensaje += `• ${item.cantidad}x ${item.titulo} (Precio bajo consulta)\n`;
    }
  });

  mensaje += `\n*Total estimado: $${total.toLocaleString("es-AR")}*`;
  if (tieneProductosBajoConsulta) {
    mensaje += `\n_(Quedo a la espera de la cotización de los artículos bajo consulta)_`;
  }

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
  );
}

function cambiarPagina(direccion) {
  paginaActual += direccion;
  actualizarPaginacion();

  // Buscamos la sección del catálogo para mover la pantalla ahí
  const seccionCatalogo = document.getElementById("catalogo");
  if (seccionCatalogo) {
    seccionCatalogo.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function actualizarPaginacion() {
  const productCards = Array.from(document.querySelectorAll(".producto-card"));
  const btnActivo = document.querySelector(".btn-filter.bg-blue-600");
  
  // Ahora, si el HTML tiene activo por defecto "Celulares", detectará "Celulares" inmediatamente al inicio.
  const categoriaActiva = btnActivo ? btnActivo.dataset.category : "todos";

  // Capturar el término buscado de manera segura
  const textoBuscado = searchInputEl ? searchInputEl.value.toLowerCase().trim() : "";

  // 1. Filtrar los productos combinando categoría Y búsqueda por texto
  const cardsFiltradas = productCards.filter((card) => {
    // Filtro por categoría
    const coincideCategoria = categoriaActiva === "todos" || card.dataset.categoria === categoriaActiva;

    // Filtro por texto en título, marca o categoría
    const titulo = (card.dataset.titulo || "").toLowerCase();
    const marca = (card.dataset.marca || "").toLowerCase();
    const categoria = (card.dataset.categoria || "").toLowerCase();

    const coincideBusqueda = !textoBuscado || 
      titulo.includes(textoBuscado) || 
      marca.includes(textoBuscado) || 
      categoria.includes(textoBuscado);

    return coincideCategoria && coincideBusqueda;
  });

  const totalProductos = cardsFiltradas.length;
  const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA) || 1;

  // Ajustar límites por seguridad
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  if (paginaActual < 1) paginaActual = 1;

  const indiceInicial = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const indiceFinal = indiceInicial + PRODUCTOS_POR_PAGINA;

  // 2. Ocultar absolutamente todas las tarjetas
  productCards.forEach((card) => (card.style.display = "none"));

  // 3. Volver a mostrar únicamente los elementos correspondientes a la página filtrada actual
  cardsFiltradas.forEach((card, index) => {
    if (index >= indiceInicial && index < indiceFinal) {
      card.style.display = "";
    }
  });

  // 4. Actualizar la interfaz de los botones de navegación
  if (currentPageNumEl) currentPageNumEl.textContent = paginaActual.toString();
  if (btnPrevPage) btnPrevPage.disabled = paginaActual === 1;
  if (btnNextPage) btnNextPage.disabled = paginaActual === totalPaginas;
}

function configurarFiltros() {
  const filterButtons = document.querySelectorAll(".btn-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // 1. Prevenimos cualquier comportamiento por defecto del click
      e.preventDefault();

      filterButtons.forEach(
        (b) =>
          (b.className =
            "btn-filter bg-slate-900 text-slate-400 text-xs md:text-sm px-5 py-2 rounded-xl border border-slate-800/80 transition-all whitespace-nowrap snap-start"),
      );
      button.className =
        "btn-filter bg-blue-600 text-white text-xs md:text-sm px-5 py-2 rounded-xl font-medium shadow-md transition-all whitespace-nowrap snap-start";

      // 2. Volvemos a la página 1 sin hacer scroll automático hacia arriba
      paginaActual = 1;
      actualizarPaginacion();
    });
  });
}

function abrirModal(card) {
  if (!modal) return;
  currentActiveProductId = card.dataset.id;

  const mImg = document.getElementById("modal-img");
  const mTitle = document.getElementById("modal-title");
  const mTag = document.getElementById("modal-tag");
  const mBrandContainer = document.getElementById("modal-brand");
  const mPrice = document.getElementById("modal-price");

  if (mImg) mImg.src = card.dataset.imagen || "";
  if (mTitle) mTitle.textContent = card.dataset.titulo || "";
  if (mTag) mTag.textContent = card.dataset.categoria || "";

  if (modalAddBtn) modalAddBtn.innerHTML = `🛒 Añadir al carrito`;

  const precio = Number(card.dataset.precio || 0);
  if (mPrice) {
    if (precio > 0) {
      mPrice.className = "text-xl sm:text-2xl font-extrabold text-white";
      mPrice.textContent = `$${precio.toLocaleString("es-AR")}`;
    } else {
      mPrice.className =
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider";
      mPrice.textContent = "Consultar precio";
    }
  }

  if (mBrandContainer) {
    const spanInterno = mBrandContainer.querySelector("span");
    if (spanInterno) spanInterno.textContent = card.dataset.marca || "";
  }

  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    if (modal.firstElementChild)
      modal.firstElementChild.classList.remove("scale-95");
  }, 10);
}

function cerrarModal() {
  if (!modal) return;
  modal.classList.add("opacity-0");
  if (modal.firstElementChild)
    modal.firstElementChild.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }, 300);
}

function configurarTarjetasProductos() {
  const productCards = document.querySelectorAll(".producto-card");
  productCards.forEach((card) => {
    card.querySelectorAll(".open-modal-trigger").forEach((t) => {
      t.addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModal(card);
      });
    });

    const addBtn = card.querySelector(".btn-add-cart");
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        agregarAlCarrito(
          card.dataset.id,
          card.dataset.titulo,
          Number(card.dataset.precio || 0),
          card.dataset.imagen,
        );
      });
    }
  });
}

function agregarDesdeModal() {
  if (currentActiveProductId) {
    const card = document.querySelector(
      `.producto-card[data-id="${currentActiveProductId}"]`,
    );
    if (card) {
      agregarAlCarrito(
        card.dataset.id,
        card.dataset.titulo,
        Number(card.dataset.precio || 0),
        card.dataset.imagen,
      );
      cerrarModal();
    }
  }
}

// ==========================================
// INICIALIZACIÓN OPTIMIZADA PARA ASTRO
// ==========================================

function ejecutarInicializacion() {
  // Verificamos si los elementos esenciales existen en el DOM actual
  if (document.getElementById("products-grid")) {
    inicializarTienda();
  }
}

// 1. Escucha estándar para la carga de página tradicional
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ejecutarInicializacion);
} else {
  ejecutarInicializacion();
}

// 2. Soporte para Astro View Transitions (por si decides activarlas en tu proyecto)
document.addEventListener("astro:page-load", ejecutarInicializacion);