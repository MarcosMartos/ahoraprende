// src/scripts/cartStore.js

let carrito = [];
const WHATSAPP_NUMBER = "5492604202201";
const DESCUENTO_PORCENTAJE = 0.1; // 10% OFF Web

const IMAGEN_DEFAULT =
  "https://ik.imagekit.io/puaijw6o8/sin-imagen.webp?updatedAt=1784392612829";

// Elementos globales del DOM
let cartCountEl, cartBtn, cartSidebar, cartOverlay, closeCartBtn;
let cartItemsContainer,
  cartTotalPriceEl,
  cartSubtotalPriceEl,
  cartDiscountPriceEl,
  whatsappCheckoutBtn;
let modal,
  closeModalBtn,
  modalAddBtn,
  currentActiveProductId = null;

// Elementos de paginación y búsqueda
let btnPrevPage, btnNextPage, currentPageNumEl, searchInputEl;
let paginaActual = 1;
const PRODUCTOS_POR_PAGINA = 12;

document.addEventListener("DOMContentLoaded", inicializarTienda);

function inicializarTienda() {
  cartCountEl = document.getElementById("cart-count");
  cartBtn = document.getElementById("cart-btn");
  cartSidebar = document.getElementById("cart-sidebar");
  cartOverlay = document.getElementById("cart-overlay");
  closeCartBtn = document.getElementById("close-cart");
  cartItemsContainer = document.getElementById("cart-items-container");

  cartTotalPriceEl = document.getElementById("cart-total-price");
  cartSubtotalPriceEl = document.getElementById("cart-subtotal-price");
  cartDiscountPriceEl = document.getElementById("cart-discount-price");

  whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");
  modal = document.getElementById("product-modal");
  closeModalBtn = document.getElementById("close-modal");
  modalAddBtn = document.getElementById("modal-add-btn");

  // Elementos de paginación
  btnPrevPage = document.getElementById("btn-prev-page");
  btnNextPage = document.getElementById("btn-next-page");
  currentPageNumEl = document.getElementById("current-page-num");

  // Input de Búsqueda
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

  // Escuchar cuando el usuario escribe en el buscador
  if (searchInputEl) {
    searchInputEl.addEventListener("input", () => {
      paginaActual = 1; // Resetea a la primera página al buscar
      actualizarPaginacion();
    });
  }

  configurarFiltros();
  configurarTarjetasProductos();
  actualizarUI();

  // Al arrancar, filtrará automáticamente usando "Celulares" (botón activo en el HTML)
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
        <p class="text-sm font-medium">Tu carrito está vacío</p>
        <p class="text-xs text-slate-600 mt-1">¡Aprovechá el 10% OFF en productos elegidos!</p>
      </div>
    `;
    if (cartSubtotalPriceEl) cartSubtotalPriceEl.textContent = "$0";
    if (cartDiscountPriceEl) cartDiscountPriceEl.textContent = "-$0";
    cartTotalPriceEl.textContent = "$0";
    return;
  }

  let subtotal = 0;
  let htmlContenido = "";

  carrito.forEach((item) => {
    subtotal += item.precio * item.cantidad;

    const precioRenderizado =
      item.precio > 0
        ? `$${(item.precio * item.cantidad).toLocaleString("es-AR")}`
        : `<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Consultar</span>`;

    const imagenItem =
      !item.imagen || item.imagen.trim() === "" || item.imagen === "undefined"
        ? IMAGEN_DEFAULT
        : item.imagen;

    htmlContenido += `
      <div class="flex gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 items-center justify-between shadow-sm">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <img src="${imagenItem}" alt="${item.titulo}" class="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800" loading="lazy" onerror="this.onerror=null; this.src='${IMAGEN_DEFAULT}';" />
          <div class="min-w-0 flex-1">
            <h4 class="text-slate-200 text-xs font-medium truncate">${item.titulo}</h4>
            <div class="mt-0.5 text-xs text-slate-300 font-bold">${precioRenderizado}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-2">
          <div class="flex items-center bg-slate-900 rounded-lg border border-slate-800 overflow-hidden text-xs">
            <button class="btn-qty-minus px-2 py-1 text-slate-400 hover:text-white font-bold" data-id="${item.id}">-</button>
            <span class="px-1.5 text-slate-200 font-bold min-w-[16px] text-center">${item.cantidad}</span>
            <button class="btn-qty-plus px-2 py-1 text-slate-400 hover:text-white font-bold" data-id="${item.id}">+</button>
          </div>
          <button class="btn-remove text-slate-500 hover:text-red-400 p-1 text-sm transition-colors" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `;
  });

  const montoDescuento = subtotal * DESCUENTO_PORCENTAJE;
  const totalConDescuento = subtotal - montoDescuento;

  cartItemsContainer.innerHTML = htmlContenido;

  if (cartSubtotalPriceEl)
    cartSubtotalPriceEl.textContent = `$${subtotal.toLocaleString("es-AR")}`;
  if (cartDiscountPriceEl)
    cartDiscountPriceEl.textContent = `-$${montoDescuento.toLocaleString("es-AR")}`;
  cartTotalPriceEl.textContent = `$${totalConDescuento.toLocaleString("es-AR")}`;

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

// 💬 Enviar pedido estructurado por WhatsApp
function enviarPedidoWhatsApp() {
  if (carrito.length === 0) return;

  let subtotal = 0;
  let tieneProductosBajoConsulta = false;
  let detallesProductos = "";

  carrito.forEach((item) => {
    subtotal += item.precio * item.cantidad;
    if (item.precio > 0) {
      detallesProductos += `  🔹 *${item.cantidad}x* ${item.titulo} — *$${(item.precio * item.cantidad).toLocaleString("es-AR")}*\n`;
    } else {
      tieneProductosBajoConsulta = true;
      detallesProductos += `  ❓ *${item.cantidad}x* ${item.titulo} — *(Precio a cotizar)*\n`;
    }
  });

  const montoDescuento = subtotal * DESCUENTO_PORCENTAJE;
  const totalFinal = subtotal - montoDescuento;

  let mensaje = `👋 ¡Hola *AhoraPrende*! ¿Cómo están?\n\n`;
  mensaje += `🛒 Quisiera encargar los siguientes productos desde la web:\n\n`;
  mensaje += detallesProductos;
  mensaje += `\n📌 *Resumen del Pedido:*\n`;
  mensaje += `▫️ Subtotal: $${subtotal.toLocaleString("es-AR")}\n`;
  mensaje += `🎉 *Descuento Web (10% OFF):* -$${montoDescuento.toLocaleString("es-AR")}\n`;
  mensaje += `💳 *TOTAL A PAGAR:* *$${totalFinal.toLocaleString("es-AR")}*\n`;

  if (tieneProductosBajoConsulta) {
    mensaje += `\n💬 _(Aguardando cotización de los ítems bajo consulta)_`;
  }

  mensaje += `\n\n✨ ¿Podrían confirmarme stock y los medios de pago disponibles? ¡Muchas gracias!`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
  );
}

function cambiarPagina(direccion) {
  paginaActual += direccion;
  actualizarPaginacion();

  const seccionCatalogo = document.getElementById("catalogo");
  if (seccionCatalogo) {
    seccionCatalogo.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// 🔍 Función Principal de Filtrado y Paginación
function actualizarPaginacion() {
  const productCards = Array.from(document.querySelectorAll(".producto-card"));

  // Detectar la categoría del botón con la clase de fondo azul 'bg-blue-600'
  const btnActivo = document.querySelector(".btn-filter.bg-blue-600");
  const categoriaActiva = btnActivo ? btnActivo.dataset.category : "Celulares";

  // Obtener el texto del input de búsqueda en minúsculas
  const textoBuscado = searchInputEl
    ? searchInputEl.value.toLowerCase().trim()
    : "";

  // 1. Filtrar las tarjetas que cumplen AMBOS criterios
  const cardsFiltradas = productCards.filter((card) => {
    // Coincidencia de Categoría (compara insensible a mayúsculas/minúsculas)
    const catCard = (card.dataset.categoria || "").toLowerCase();
    const catFiltro = categoriaActiva.toLowerCase();
    const coincideCategoria =
      categoriaActiva === "todos" || catCard === catFiltro;

    // Coincidencia de Búsqueda de Texto
    const titulo = (card.dataset.titulo || "").toLowerCase();
    const marca = (card.dataset.marca || "").toLowerCase();

    const coincideBusqueda =
      !textoBuscado ||
      titulo.includes(textoBuscado) ||
      marca.includes(textoBuscado) ||
      catCard.includes(textoBuscado);

    return coincideCategoria && coincideBusqueda;
  });

  const totalProductos = cardsFiltradas.length;
  const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA) || 1;

  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  if (paginaActual < 1) paginaActual = 1;

  const indiceInicial = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const indiceFinal = indiceInicial + PRODUCTOS_POR_PAGINA;

  // 2. Ocultar todas las tarjetas
  productCards.forEach((card) => (card.style.display = "none"));

  // 3. Mostrar únicamente los elementos correspondientes a la página visible
  cardsFiltradas.forEach((card, index) => {
    if (index >= indiceInicial && index < indiceFinal) {
      card.style.display = "";
    }
  });

  // 4. Actualizar estado numérico y estado de botones Prev/Next
  if (currentPageNumEl) currentPageNumEl.textContent = paginaActual.toString();
  if (btnPrevPage) btnPrevPage.disabled = paginaActual === 1;
  if (btnNextPage) btnNextPage.disabled = paginaActual === totalPaginas;
}

// 🎛️ Configuración de clicks en los botones de categoría
function configurarFiltros() {
  const filterButtons = document.querySelectorAll(".btn-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // Resetear clases de todos los botones a inactivo
      filterButtons.forEach(
        (b) =>
          (b.className =
            "btn-filter bg-slate-900 text-slate-400 text-xs md:text-sm px-5 py-2 rounded-xl border border-slate-800/80 transition-all whitespace-nowrap snap-start"),
      );

      // Aplicar estilos activos al botón presionado
      button.className =
        "btn-filter bg-blue-600 text-white text-xs md:text-sm px-5 py-2 rounded-xl font-medium shadow-md transition-all whitespace-nowrap snap-start";

      paginaActual = 1; // Volver a la página 1 tras cambiar filtro
      actualizarPaginacion();
    });
  });
}

function configurarTarjetasProductos() {
  const productCards = document.querySelectorAll(".producto-card");

  productCards.forEach((card) => {
    const addBtn = card.querySelector(".btn-add-cart");
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = card.dataset.id;
        const titulo = card.dataset.titulo;
        const precio = parseFloat(card.dataset.precio || "0");
        const imagen = card.dataset.imagen;
        agregarAlCarrito(id, titulo, precio, imagen);
      });
    }

    const modalTriggers = card.querySelectorAll(".open-modal-trigger");
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => abrirModal(card));
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

  const imagenProducto = card.dataset.imagen;
  const tituloProducto = card.dataset.titulo || "";

  if (mImg) {
    mImg.alt = tituloProducto || "Producto";
    mImg.src =
      !imagenProducto ||
      imagenProducto.trim() === "" ||
      imagenProducto === "undefined"
        ? IMAGEN_DEFAULT
        : imagenProducto;
  }

  if (mTitle) mTitle.textContent = tituloProducto;
  if (mTag) mTag.textContent = card.dataset.categoria || "Gral";
  if (mBrandContainer) {
    const span = mBrandContainer.querySelector("span");
    if (span) span.textContent = card.dataset.marca || "Genérico";
  }

  const precio = parseFloat(card.dataset.precio || "0");
  if (mPrice) {
    if (precio > 0) {
      const precioDesc = precio * (1 - DESCUENTO_PORCENTAJE);
      mPrice.innerHTML = `
        <div class="flex flex-col">
          <span class="text-xs text-slate-400 line-through">$${precio.toLocaleString("es-AR")}</span>
          <span class="text-2xl font-bold text-cyan-300">$${precioDesc.toLocaleString("es-AR")} <span class="text-xs bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 font-semibold">10% OFF</span></span>
        </div>
      `;
    } else {
      mPrice.innerHTML = `<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Consultar precio</span>`;
    }
  }

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    const container = modal.querySelector("div");
    if (container) container.classList.remove("scale-95");
  }, 10);
  document.body.classList.add("overflow-hidden");
}

function cerrarModal() {
  if (!modal) return;
  modal.classList.add("opacity-0");
  const container = modal.querySelector("div");
  if (container) container.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }, 300);
}

function agregarDesdeModal() {
  if (!currentActiveProductId) return;
  const card = document.querySelector(
    `.producto-card[data-id="${currentActiveProductId}"]`,
  );
  if (card) {
    const id = card.dataset.id;
    const titulo = card.dataset.titulo;
    const precio = parseFloat(card.dataset.precio || "0");
    const imagen = card.dataset.imagen;
    agregarAlCarrito(id, titulo, precio, imagen);
    cerrarModal();
  }
}
