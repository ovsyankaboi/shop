const PRODUCTS = [
  { id: 1, title: 'Полупромышленные сплит-системы', price: 80000,  img: 'assets/split.jpg' },
  { id: 2, title: 'Мульти-сплит системы',            price: 40000,  img: 'assets/multisplit.jpg' },
  { id: 3, title: 'Отопление',                       price: 20000,  img: 'assets/heating.jpg' },
  { id: 4, title: 'Вентиляционные системы',          price: 5000,   img: 'assets/ventilation.jpg' },
  { id: 5, title: 'Бытовые кондиционеры',            price: 30000,  img: 'assets/consumer-ac.jpg',   from: true },
  { id: 6, title: 'Промышленные кондиционеры',       price: 100000, img: 'assets/industrial-ac.jpg', from: true },
];


const STORAGE_KEY = 'climate_shop_cart';
const loadCart  = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');   // {id: qty}
const saveCart  = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c));

const productsEl   = document.getElementById('products');
const cartBtn      = document.getElementById('cartBtn');
const cartCountEl  = document.getElementById('cartCount');
const modal        = document.getElementById('checkoutModal');
const cartEl       = document.getElementById('cart');
const totalEl      = document.getElementById('total');
const clearCartBtn = document.getElementById('clearCart');
const createOrderBtn = document.getElementById('createOrder');
const orderForm    = document.getElementById('orderForm');

let cart = loadCart();

function renderProducts(){
  productsEl.innerHTML = PRODUCTS.map(p => {
    const priceLabel = (p.from ? 'от ' : '') + p.price.toLocaleString('ru-RU') + ' ₽';
    return `
      <article class="card" data-id="${p.id}">
        <img class="card__img" src="${p.img}" alt="${p.title}" loading="lazy"
             onerror="this.src='https://picsum.photos/seed/fallback${p.id}/600/400'">
        <div class="card__body">
          <h3 class="card__title">${p.title}</h3>
          <div class="card__price">${priceLabel}</div>

          <div class="selector">
            <div class="selector__row">
              <div class="qty">
                <button class="qty-btn" data-dec>-</button>
                <span data-qty>1</span>
                <button class="qty-btn" data-inc>+</button>
              </div>
              <div class="selector__sum" data-sum">${p.price.toLocaleString('ru-RU')} ₽</div>
            </div>
            <button class="btn primary" data-add>Добавить в корзину</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}


function updateCartCount(){
  const n = Object.values(cart).reduce((s,q)=>s+q,0);
  cartCountEl.textContent = n;
}

function computeTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const prod = PRODUCTS.find(p=>p.id===Number(id));
    return sum + (prod ? prod.price*qty : 0);
  },0);
}

function renderCart(){
  const ids = Object.keys(cart);
  if (!ids.length){
    cartEl.innerHTML = `<p class="subtitle">Корзина пуста. Добавьте товары.</p>`;
    totalEl.textContent = `0 ₽`;
    return;
  }
  cartEl.innerHTML = ids.map(id=>{
    const p = PRODUCTS.find(x=>x.id===Number(id));
    const qty = cart[id];
    const sum = p.price * qty;
    return `
      <div class="cart__item" data-id="${id}">
        <div class="cart__title">${p.title}</div>
        <div class="qty">
          <button class="qty-btn" data-dec>-</button>
          <span>${qty}</span>
          <button class="qty-btn" data-inc>+</button>
        </div>
        <div class="cart__sum">${sum.toLocaleString('ru-RU')} ₽</div>
        <button class="btn" data-remove>Убрать</button>
      </div>
    `;
  }).join('');
  totalEl.textContent = `${computeTotal().toLocaleString('ru-RU')} ₽`;
}

function openModal(){
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  orderForm.hidden = true;
  renderCart();
}
function closeModal(){
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

document.addEventListener('click',(e)=>{
  const card = e.target.closest('.card');
  if (card){
    const id   = Number(card.dataset.id);
    const prod = PRODUCTS.find(p=>p.id===id);
    const qtyEl = card.querySelector('[data-qty]');
    const sumEl = card.querySelector('[data-sum]');

    if (e.target.matches('[data-inc]')){
      const q = Number(qtyEl.textContent) + 1;
      qtyEl.textContent = q;
      sumEl.textContent = (prod.price*q).toLocaleString('ru-RU') + ' ₽';
      return;
    }
    if (e.target.matches('[data-dec]')){
      const q = Math.max(1, Number(qtyEl.textContent) - 1);
      qtyEl.textContent = q;
      sumEl.textContent = (prod.price*q).toLocaleString('ru-RU') + ' ₽';
      return;
    }
    if (e.target.matches('[data-add]')){
      const q = Number(qtyEl.textContent);
      cart[id] = (cart[id]||0) + q;
      saveCart(cart);
      updateCartCount();
      
      qtyEl.textContent = 1;
      sumEl.textContent = prod.price.toLocaleString('ru-RU') + ' ₽';
      return;
    }
  }

  const row = e.target.closest('.cart__item');
  if (row){
    const id = row.dataset.id;
    if (e.target.matches('[data-inc]')){
      cart[id] = (cart[id]||0)+1;
      saveCart(cart); renderCart(); updateCartCount();
    }
    if (e.target.matches('[data-dec]')){
      cart[id] = Math.max(0,(cart[id]||0)-1);
      if (cart[id]===0) delete cart[id];
      saveCart(cart); renderCart(); updateCartCount();
    }
    if (e.target.matches('[data-remove]')){
      delete cart[id];
      saveCart(cart); renderCart(); updateCartCount();
    }
  }


  if (e.target.matches('[data-close]')) closeModal();
});

cartBtn.addEventListener('click',(e)=>{ e.preventDefault(); openModal(); });

document.getElementById('clearCart').addEventListener('click', ()=>{
  cart = {}; saveCart(cart); renderCart(); updateCartCount();
});

document.getElementById('createOrder').addEventListener('click', ()=>{
  if (!Object.keys(cart).length){ alert('Корзина пуста'); return; }
  orderForm.hidden = false;
  orderForm.scrollIntoView({behavior:'smooth', block:'end'});
});

orderForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  if (!Object.keys(cart).length){ alert('Корзина пуста'); return; }
  const data = Object.fromEntries(new FormData(orderForm).entries());
  console.log('Заказ:', {data, cart});
  alert('Спасибо! Заказ отправлен (демо).');
  cart = {}; saveCart(cart); updateCartCount(); renderCart();
  orderForm.reset(); orderForm.hidden = true; closeModal();
});

document.addEventListener('keydown',(e)=>{
  if (e.key==='Escape' && modal.classList.contains('is-open')) closeModal();
});

renderProducts();
updateCartCount();
