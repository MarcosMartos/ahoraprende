// src/scripts/cartStore.js



let carrito = [];

const WHATSAPP_NUMBER = "5492604000000";



// Variables globales para los elementos del DOM

let cartCountEl, cartBtn, cartSidebar, cartOverlay, closeCartBtn;

let cartItemsContainer, cartTotalPriceEl, whatsappCheckoutBtn;

let modal, closeModalBtn, modalAddBtn, currentActiveProductId = null;



// Inicialización controlada una vez que el DOM está 100% listo

function inicializarTienda() {

  // Cacheamos referencias de forma segura

  cartCountEl = document.getElementById('cart-count');

  cartBtn = document.getElementById('cart-btn');

  cartSidebar = document.getElementById('cart-sidebar');

  cartOverlay = document.getElementById('cart-overlay');

  closeCartBtn = document.getElementById('close-cart');

  cartItemsContainer = document.getElementById('cart-items-container');

  cartTotalPriceEl = document.getElementById('cart-total-price');

  whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');

  modal = document.getElementById('product-modal');

  closeModalBtn = document.getElementById('close-modal');

  modalAddBtn = document.getElementById('modal-add-btn');



  // Asignación limpia de listeners principales

  if (cartBtn) cartBtn.addEventListener('click', abrirCarrito);

  if (closeCartBtn) closeCartBtn.addEventListener('click', cerrarCarrito);

  if (cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);

  if (closeModalBtn) closeModalBtn.addEventListener('click', cerrarModal);

 

  if (modal) {

    modal.addEventListener('click', (e) => {

      if (e.target === modal) cerrarModal();

    });

  }



  if (whatsappCheckoutBtn) {

    whatsappCheckoutBtn.addEventListener('click', enviarPedidoWhatsApp);

  }



  if (modalAddBtn) {

    modalAddBtn.addEventListener('click', agregarDesdeModal);

  }



  // Configurar listeners de categorías y tarjetas de productos

  configurarFiltros();

  configurarTarjetasProductos();



  // Renderizar estado inicial

  actualizarUI();

}



function abrirCarrito() {

  if (!cartSidebar || !cartOverlay) return;

  cartSidebar.classList.remove('invisible');

  cartOverlay.classList.remove('opacity-0');

  const innerSidebar = cartSidebar.querySelector('.absolute.right-0');

  if (innerSidebar) innerSidebar.classList.remove('translate-x-full');

  document.body.classList.add('overflow-hidden');

}



function cerrarCarrito() {

  if (!cartSidebar || !cartOverlay) return;

  cartOverlay.classList.add('opacity-0');

  const innerSidebar = cartSidebar.querySelector('.absolute.right-0');

  if (innerSidebar) innerSidebar.classList.add('translate-x-full');

  setTimeout(() => {

    cartSidebar.classList.add('invisible');

    document.body.classList.remove('overflow-hidden');

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

  let htmlContenido = '';

 

  carrito.forEach(item => {

    total += item.precio * item.cantidad;

    htmlContenido += `

      <div class="flex gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 items-center justify-between">

        <div class="flex items-center gap-3 min-w-0 flex-1">

          <img src="${item.imagen}" alt="${item.titulo}" class="w-11 h-11 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800" loading="lazy" />

          <div class="min-w-0 flex-1">

            <h4 class="text-slate-200 text-xs font-medium truncate">${item.titulo}</h4>

            <p class="text-blue-400 text-xs font-bold mt-0.5">$${item.precio.toLocaleString('es-AR')}</p>

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

  cartTotalPriceEl.textContent = `$${total.toLocaleString('es-AR')}`;



  // Vincular eventos a la UI del carrito dinámicamente

  cartItemsContainer.querySelectorAll('.btn-qty-plus').forEach(btn => btn.addEventListener('click', () => modificarCantidad(btn.dataset.id, 1)));

  cartItemsContainer.querySelectorAll('.btn-qty-minus').forEach(btn => btn.addEventListener('click', () => modificarCantidad(btn.dataset.id, -1)));

  cartItemsContainer.querySelectorAll('.btn-remove').forEach(btn => btn.addEventListener('click', () => eliminarDelCarrito(btn.dataset.id)));

}



function agregarAlCarrito(id, titulo, precio, imagen) {

  const itemExistente = carrito.find(item => item.id === id);

  if (itemExistente) { itemExistente.cantidad += 1; }

  else { carrito.push({ id, titulo, precio, imagen, cantidad: 1 }); }

  actualizarUI();

  abrirCarrito();

}



function modificarCantidad(id, cambio) {

  const item = carrito.find(item => item.id === id);

  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) { eliminarDelCarrito(id); } else { actualizarUI(); }

}



function eliminarDelCarrito(id) {

  carrito = carrito.filter(item => item.id !== id);

  actualizarUI();

}



function enviarPedidoWhatsApp() {

  if (carrito.length === 0) return;

  let mensaje = '¡Hola AhoraPrende! Me gustaría encargar:\n\n';

  let total = 0;

  carrito.forEach(item => {

    total += item.precio * item.cantidad;

    mensaje += `• ${item.cantidad}x ${item.titulo}\n`;

  });

  mensaje += `\n*Total estimado: $${total.toLocaleString('es-AR')}*`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');

}



function configurarFiltros() {

  const filterButtons = document.querySelectorAll('.btn-filter');

  const productCards = document.querySelectorAll('.producto-card');

 

  filterButtons.forEach(button => {

    button.addEventListener('click', () => {

      const cat = button.dataset.category;

      filterButtons.forEach(b => b.className = "btn-filter bg-slate-900 text-slate-400 text-xs md:text-sm px-5 py-2 rounded-xl border border-slate-800/80 transition-all whitespace-nowrap snap-start");

      button.className = "btn-filter bg-blue-600 text-white text-xs md:text-sm px-5 py-2 rounded-xl font-medium shadow-md transition-all whitespace-nowrap snap-start";

     

      productCards.forEach(c => {

        if (cat === 'todos' || c.dataset.categoria === cat) {

          c.style.display = '';

        } else {

          c.style.display = 'none';

        }

      });

    });

  });

}



function abrirModal(card) {

  if (!modal) return;

  currentActiveProductId = card.dataset.id;

 

  const mImg = document.getElementById('modal-img');

  const mTitle = document.getElementById('modal-title');

  const mTag = document.getElementById('modal-tag');

  const mBrandContainer = document.getElementById('modal-brand');

  const mPrice = document.getElementById('modal-price');

  const mStock = document.getElementById('modal-stock');



  if (mImg) mImg.src = card.dataset.imagen || '';

  if (mTitle) mTitle.textContent = card.dataset.titulo || '';

  if (mTag) mTag.textContent = card.dataset.categoria || '';

  if (mPrice) mPrice.textContent = `$${Number(card.dataset.precio || 0).toLocaleString('es-AR')}`;

  if (mStock) mStock.textContent = `Disponibles: ${card.dataset.stock || 0} u.`;

 

  if (mBrandContainer) {

    const spanInterno = mBrandContainer.querySelector('span');

    if (spanInterno) spanInterno.textContent = card.dataset.marca || '';

  }



  modal.classList.remove('hidden');

  document.body.classList.add('overflow-hidden');

  setTimeout(() => {

    modal.classList.remove('opacity-0');

    if (modal.firstElementChild) modal.firstElementChild.classList.remove('scale-95');

  }, 10);

}



function cerrarModal() {

  if (!modal) return;

  modal.classList.add('opacity-0');

  if (modal.firstElementChild) modal.firstElementChild.classList.add('scale-95');

  setTimeout(() => {

    modal.classList.add('hidden');

    document.body.classList.remove('overflow-hidden');

  }, 300);

}



function configurarTarjetasProductos() {

  const productCards = document.querySelectorAll('.producto-card');

  productCards.forEach(card => {

    card.querySelectorAll('.open-modal-trigger').forEach(t => {

      t.addEventListener('click', (e) => {

        e.stopPropagation();

        abrirModal(card);

      });

    });

   

    const addBtn = card.querySelector('.btn-add-cart');

    if (addBtn) {

      addBtn.addEventListener('click', (e) => {

        e.stopPropagation();

        agregarAlCarrito(card.dataset.id, card.dataset.titulo, Number(card.dataset.precio || 0), card.dataset.imagen);

      });

    }

  });

}



function agregarDesdeModal() {

  if (currentActiveProductId) {

    const card = document.querySelector(`.producto-card[data-id="${currentActiveProductId}"]`);

    if (card) {

      agregarAlCarrito(card.dataset.id, card.dataset.titulo, Number(card.dataset.precio || 0), card.dataset.imagen);

      cerrarModal();

    }

  }

}



// Aseguramos la ejecución limpia escuchando al DOM

if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', inicializarTienda);

} else {

  inicializarTienda();

} 