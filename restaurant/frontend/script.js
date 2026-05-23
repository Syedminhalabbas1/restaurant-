// script.js — DineFlow Management System — Shared Logic

// ─── CART ────────────────────────────────────
function getCart() {
  return JSON.parse(sessionStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(menu_id, name, price) {
  const cart = getCart();
  const existing = cart.find(i => i.menu_id === menu_id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ menu_id, name, price: parseFloat(price), quantity: 1 });
  }
  saveCart(cart);
  showToast(`✅ ${name} added to cart!`);
}

function removeFromCart(menu_id) {
  const cart = getCart().filter(i => i.menu_id !== menu_id);
  saveCart(cart);
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (el) {
    const total = getCart().reduce((s, i) => s + i.quantity, 0);
    el.textContent = total;
  }
}

// ─── TOAST ───────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}   