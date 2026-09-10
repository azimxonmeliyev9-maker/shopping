// app.js - Full Interactive Logic for Shopping Web App

// Application State
let state = {
  products: JSON.parse(localStorage.getItem('shopping_products')) || initialData.products,
  cart: JSON.parse(localStorage.getItem('shopping_cart')) || [],
  reviews: JSON.parse(localStorage.getItem('shopping_reviews')) || initialData.reviews,
  activityLogs: JSON.parse(localStorage.getItem('shopping_activity_logs')) || initialData.activityLogs,
  currentCategory: 'all',
  searchQuery: '',
  sortBy: 'featured',
  lang: localStorage.getItem('shopping_lang') || 'uz',
  discountPercent: 0,
  appliedPromo: '',
  theme: localStorage.getItem('shopping_theme') || 'dark'
};

// Format currency
function formatUZS(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('langSelect').value = state.lang;
  updateLanguageTexts();
  renderCategories();
  renderProducts();
  renderSubscriptionTiers();
  renderReviews();
  renderActivityLogs();
  updateCartBadge();
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Theme Toggle
function initTheme() {
  const htmlEl = document.documentElement;
  const sunIcon = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');

  if (state.theme === 'light') {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
    document.body.classList.remove('bg-[#080c14]', 'text-slate-100');
    document.body.classList.add('bg-slate-100', 'text-slate-800');
    if (sunIcon && moonIcon) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  } else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
    document.body.classList.remove('bg-slate-100', 'text-slate-800');
    document.body.classList.add('bg-[#080c14]', 'text-slate-100');
    if (sunIcon && moonIcon) {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('shopping_theme', state.theme);
  initTheme();
  showToast(state.theme === 'dark' ? "Tungi rejim yoqildi" : "Kunduzgi rejim yoqildi", "info");
}

// Multi-language
function changeLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('shopping_lang', lang);
  updateLanguageTexts();
  renderCategories();
  renderProducts();
  renderSubscriptionTiers();
  renderReviews();
  renderActivityLogs();
  renderCart();
  if (window.lucide) lucide.createIcons();
}

function updateLanguageTexts() {
  const t = initialData.translations[state.lang] || initialData.translations.uz;
  const navSub = document.getElementById('nav-subtitle');
  if (navSub) navSub.textContent = t.brandSub;
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;

  const catalogTitle = document.getElementById('catalog-title');
  if (catalogTitle) catalogTitle.textContent = state.lang === 'uz' ? 'Mahsulotlar Katalogi' : (state.lang === 'ru' ? 'Каталог товаров' : 'Product Catalog');

  const txtPlatformTitle = document.getElementById('txt-platform-title');
  if (txtPlatformTitle) txtPlatformTitle.textContent = t.adminPlatformTitle;

  const txtPlatformDesc = document.getElementById('txt-platform-desc');
  if (txtPlatformDesc) txtPlatformDesc.textContent = t.adminPlatformSub;

  const txtTierTitle = document.getElementById('txt-tier-title');
  if (txtTierTitle) txtTierTitle.innerHTML = `<i data-lucide="zap" class="w-4 h-4 text-amber-400"></i> ${t.tierTitle}`;

  const txtReviewsTitle = document.getElementById('txt-reviews-title');
  if (txtReviewsTitle) txtReviewsTitle.innerHTML = `<i data-lucide="star" class="w-4 h-4 text-amber-400"></i> ${t.reviewTitle}`;

  const txtActivityTitle = document.getElementById('txt-activity-title');
  if (txtActivityTitle) txtActivityTitle.innerHTML = `<i data-lucide="activity" class="w-4 h-4 text-cyan-400"></i> ${t.activityTitle}`;

  const txtAdminNav = document.getElementById('txt-admin-nav');
  if (txtAdminNav) txtAdminNav.textContent = t.adminBtn;

  const cartDrawerTitle = document.getElementById('cartDrawerTitle');
  if (cartDrawerTitle) cartDrawerTitle.textContent = t.cartTitle;

  const txtCheckoutBtn = document.getElementById('txt-checkout-btn');
  if (txtCheckoutBtn) txtCheckoutBtn.textContent = t.checkoutBtn;
}

// Render Categories
function renderCategories() {
  const container = document.getElementById('categoriesBar');
  if (!container) return;

  container.innerHTML = initialData.categories.map(cat => {
    const isActive = state.currentCategory === cat.id;
    const catName = cat[`name_${state.lang}`] || cat.name_uz;
    return `
      <button 
        onclick="selectCategory('${cat.id}')"
        class="cat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
          isActive 
            ? 'active bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10' 
            : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
        }"
      >
        <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
        <span>${catName}</span>
      </button>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function selectCategory(catId) {
  state.currentCategory = catId;
  renderCategories();
  renderProducts();
}

// Search & Sort Handlers
function handleSearch(val) {
  state.searchQuery = val.trim().toLowerCase();
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    if (state.searchQuery) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderProducts();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  state.searchQuery = '';
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderProducts();
}

function toggleMobileSearch() {
  const cont = document.getElementById('mobileSearchContainer');
  if (cont) cont.classList.toggle('hidden');
}

function handleSort(val) {
  state.sortBy = val;
  renderProducts();
}

function resetFilters() {
  state.currentCategory = 'all';
  state.searchQuery = '';
  state.sortBy = 'featured';
  const sInput = document.getElementById('searchInput');
  if (sInput) sInput.value = '';
  renderCategories();
  renderProducts();
}

// Render Product Catalog
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countEl = document.getElementById('catalog-count');
  const emptyState = document.getElementById('emptyCatalogState');
  if (!grid) return;

  // Filter
  let filtered = state.products.filter(p => {
    const matchCategory = state.currentCategory === 'all' || p.category === state.currentCategory;
    const title = (p[`title_${state.lang}`] || p.title_uz).toLowerCase();
    const desc = (p[`desc_${state.lang}`] || p.desc_uz).toLowerCase();
    const matchSearch = !state.searchQuery || title.includes(state.searchQuery) || desc.includes(state.searchQuery);
    return matchCategory && matchSearch;
  });

  // Sort
  if (state.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (countEl) {
    countEl.textContent = `${filtered.length} ta mahsulot mavjud`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const t = initialData.translations[state.lang] || initialData.translations.uz;

  grid.innerHTML = filtered.map(p => {
    const title = p[`title_${state.lang}`] || p.title_uz;
    const desc = p[`desc_${state.lang}`] || p.desc_uz;
    const isDiscounted = p.oldPrice && p.oldPrice > p.price;
    const discountPercent = isDiscounted ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

    return `
      <div class="neon-card glass-panel rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/60 flex flex-col justify-between group">
        
        <!-- Image & Tags -->
        <div class="relative h-48 w-full overflow-hidden bg-slate-950">
          <img 
            src="${p.image}" 
            alt="${title}" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[10px] font-extrabold tracking-wide uppercase shadow-md">
              ${p.tag || 'NEW'}
            </span>
            ${isDiscounted ? `
              <span class="px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[10px] font-bold">
                -${discountPercent}%
              </span>
            ` : ''}
          </div>

          <!-- Quick View trigger -->
          <button 
            onclick="openProductModal(${p.id})" 
            title="Batafsil"
            class="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition duration-200 border border-slate-700/60"
          >
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Stock Indicator -->
          <div class="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] font-medium text-slate-300">
            <span class="w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-400 pulse-badge' : 'bg-rose-500'}"></span>
            <span>${p.stock > 0 ? `${t.inStock} (${p.stock})` : t.outOfStock}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span class="capitalize text-cyan-400 font-semibold text-[11px]">${p.category}</span>
              <div class="flex items-center gap-1 text-amber-400">
                <i data-lucide="star" class="w-3 h-3 star-filled"></i>
                <span class="font-bold text-xs">${p.rating}</span>
                <span class="text-slate-500 text-[10px]">(${p.reviewsCount})</span>
              </div>
            </div>

            <h3 class="font-bold text-sm text-white group-hover:text-emerald-400 transition leading-snug line-clamp-1">
              ${title}
            </h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              ${desc}
            </p>
          </div>

          <!-- Price & Add Button -->
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div>
              <div class="text-emerald-400 font-extrabold text-sm sm:text-base">
                ${formatUZS(p.price)}
              </div>
              ${isDiscounted ? `
                <div class="text-slate-500 line-through text-[11px]">
                  ${formatUZS(p.oldPrice)}
                </div>
              ` : ''}
            </div>

            <button 
              onclick="addToCart(${p.id})"
              class="btn-neon px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md"
            >
              <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
              <span>${t.addToCart}</span>
            </button>
          </div>

        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// 1. Render Subscription Tiers
function renderSubscriptionTiers() {
  const container = document.getElementById('subscriptionTiersContainer');
  if (!container) return;

  container.innerHTML = initialData.subscriptionTiers.map(tier => {
    const name = tier[`name_${state.lang}`] || tier.name_uz;
    const period = tier[`period_${state.lang}`] || tier.period_uz;
    const features = tier[`features_${state.lang}`] || tier.features_uz;
    const btnText = tier[`btnText_${state.lang}`] || tier.btnText_uz;

    const isPro = tier.id === 'pro';

    return `
      <div class="p-4 rounded-xl border ${
        isPro 
          ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-cyan-950/30 shadow-lg shadow-emerald-500/10' 
          : 'border-slate-800 bg-slate-900/60'
      } relative overflow-hidden transition-all hover:border-slate-700">
        
        ${isPro ? `
          <span class="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 pulse-badge">
            ${tier.badge}
          </span>
        ` : ''}

        <div class="flex items-baseline justify-between mb-2">
          <div>
            <h4 class="font-bold text-sm text-white">${name}</h4>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-base font-black text-emerald-400">${tier.price}</span>
              <span class="text-[11px] text-slate-400">${period}</span>
            </div>
          </div>
        </div>

        <ul class="space-y-1.5 text-xs text-slate-300 my-3">
          ${features.map(f => `
            <li class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0"></i>
              <span class="text-[11px] leading-tight">${f}</span>
            </li>
          `).join('')}
        </ul>

        <button 
          onclick="selectSubscription('${tier.id}', '${name}')"
          class="w-full ${isPro ? 'btn-neon' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'} py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <i data-lucide="${isPro ? 'sparkles' : 'arrow-right'}" class="w-3.5 h-3.5"></i>
          <span>${btnText}</span>
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function selectSubscription(tierId, tierName) {
  addActivityLog('subscription', `"${tierName}" ta'rifiga muvaffaqiyatli obuna bo'lindi`, 'Tarif Faollashdi', 'violet');
  showToast(`Tabriklaymiz! ${tierName} faollashtirildi!`, 'success');
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 }
  });
}

// 2. Render Reviews
function renderReviews() {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  container.innerHTML = state.reviews.map(r => {
    const comment = r[`comment_${state.lang}`] || r.comment_uz;
    return `
      <div class="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <img src="${r.avatar}" alt="${r.author}" class="w-7 h-7 rounded-full object-cover border border-emerald-500/40">
            <div>
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold text-white">${r.author}</span>
                ${r.verified ? `<i data-lucide="badge-check" class="w-3.5 h-3.5 text-emerald-400"></i>` : ''}
              </div>
              <span class="text-[10px] text-slate-400">${r.role || 'Mijoz'}</span>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center gap-0.5 text-amber-400 text-xs">
              ${Array.from({ length: 5 }, (_, i) => `
                <i data-lucide="star" class="w-2.5 h-2.5 ${i < r.rating ? 'star-filled' : 'text-slate-600'}"></i>
              `).join('')}
            </div>
            <span class="text-[9px] text-slate-500">${r.date}</span>
          </div>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed italic">
          "${comment}"
        </p>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function scrollToReviews() {
  const el = document.getElementById('reviewsSection');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// 3. Render Activity Logs
function renderActivityLogs() {
  const container = document.getElementById('activityLogList');
  if (!container) return;

  const colorMap = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    violet: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };

  container.innerHTML = state.activityLogs.map(log => {
    const title = log[`title_${state.lang}`] || log.title_uz;
    const badge = log[`badge_${state.lang}`] || log.badge_uz;
    const colorClass = colorMap[log.badgeColor] || colorMap.emerald;

    return `
      <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex-shrink-0">
            <i data-lucide="${log.icon || 'circle'}" class="w-3.5 h-3.5"></i>
          </div>
          <div class="truncate">
            <p class="text-slate-200 font-medium text-xs truncate">${title}</p>
            <span class="text-[10px] text-slate-500">${log.time}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap flex-shrink-0 ${colorClass}">
          ${badge}
        </span>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function addActivityLog(type, title, badge, color = 'emerald') {
  const newLog = {
    id: Date.now(),
    type,
    icon: type === 'product_add' ? 'box' : (type === 'subscription' ? 'sparkles' : (type === 'review' ? 'message-square' : 'shopping-bag')),
    badge_uz: badge,
    badge_en: badge,
    badge_ru: badge,
    badgeColor: color,
    title_uz: title,
    title_en: title,
    title_ru: title,
    time: 'Hozirgina'
  };
  state.activityLogs.unshift(newLog);
  if (state.activityLogs.length > 20) state.activityLogs.pop();
  localStorage.setItem('shopping_activity_logs', JSON.stringify(state.activityLogs));
  renderActivityLogs();
}

// Shopping Cart Logic
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty < product.stock) {
      existing.qty += 1;
      showToast(`"${product.title_uz}" soni oshirildi (+1)`, 'info');
    } else {
      showToast(`Kechirasiz, omborda faqat ${product.stock} ta mavjud`, 'warning');
      return;
    }
  } else {
    state.cart.push({
      id: product.id,
      title: product.title_uz,
      price: product.price,
      image: product.image,
      stock: product.stock,
      qty: 1
    });
    showToast(`"${product.title_uz}" savatchaga qo'shildi!`, 'success');
  }

  saveCart();
  updateCartBadge();
  addActivityLog('cart', `Savatchaga qo'shildi: "${product.title_uz}"`, 'Savatcha', 'cyan');
}

function updateQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== productId);
    showToast("Mahsulot savatchadan olib tashlandi", "info");
  } else if (item.qty > item.stock) {
    item.qty = item.stock;
    showToast(`Maksimal zaxira: ${item.stock} ta`, "warning");
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast("Mahsulot o'chirildi", "info");
}

function saveCart() {
  localStorage.setItem('shopping_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.textContent = totalCount;
}

// Render Cart Drawer
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const panel = document.getElementById('cartPanel');
  const backdrop = document.getElementById('cartBackdrop');
  
  if (drawer && panel && backdrop) {
    drawer.classList.remove('pointer-events-none');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    panel.classList.remove('translate-x-full');
  }
  renderCart();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const panel = document.getElementById('cartPanel');
  const backdrop = document.getElementById('cartBackdrop');

  if (drawer && panel && backdrop) {
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    panel.classList.add('translate-x-full');
    setTimeout(() => {
      drawer.classList.add('pointer-events-none');
    }, 300);
  }
}

function renderCart() {
  const listEl = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartTotalItemsCount');
  if (!listEl) return;

  const totalItems = state.cart.reduce((sum, i) => sum + i.qty, 0);
  if (countEl) countEl.textContent = `${totalItems} dona`;

  if (state.cart.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-16 text-slate-500 space-y-3">
        <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto text-slate-600"></i>
        <p class="text-sm font-semibold text-slate-400">Savatchangiz bo'sh</p>
        <p class="text-xs text-slate-500">Mahsulotlarni ko'rib, savatchaga qo'shing.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 UZS';
    if (discountEl) discountEl.textContent = '0 UZS';
    if (totalEl) totalEl.textContent = '0 UZS';
    if (window.lucide) lucide.createIcons();
    return;
  }

  listEl.innerHTML = state.cart.map(item => `
    <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
      <img src="${item.image}" alt="${item.title}" class="w-14 h-14 rounded-lg object-cover bg-slate-950 border border-slate-800">
      
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-xs text-white truncate">${item.title}</h4>
        <div class="text-emerald-400 font-bold text-xs mt-0.5">${formatUZS(item.price)}</div>
        
        <!-- Counter -->
        <div class="flex items-center gap-2 mt-2">
          <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">-</button>
          <span class="text-xs font-extrabold text-white w-5 text-center">${item.qty}</span>
          <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">+</button>
        </div>
      </div>

      <button onclick="removeFromCart(${item.id})" class="p-2 text-slate-500 hover:text-rose-400 transition">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const discount = Math.round(subtotal * (state.discountPercent / 100));
  const total = subtotal - discount;

  if (subtotalEl) subtotalEl.textContent = formatUZS(subtotal);
  if (discountEl) discountEl.textContent = discount > 0 ? `-${formatUZS(discount)} (${state.discountPercent}%)` : '0 UZS';
  if (totalEl) totalEl.textContent = formatUZS(total);

  if (window.lucide) lucide.createIcons();
}

// Promo Code
function applyPromoCode() {
  const input = document.getElementById('promoInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'TECH2026') {
    state.discountPercent = 20;
    state.appliedPromo = 'TECH2026';
    showToast("Promokod qabul qilindi! 20% chegirma berildi 🎉", "success");
  } else if (code === 'ADMINHUB') {
    state.discountPercent = 15;
    state.appliedPromo = 'ADMINHUB';
    showToast("Promokod qabul qilindi! 15% chegirma berildi 🚀", "success");
  } else if (code === '') {
    showToast("Iltimos, promokod kiriting", "warning");
    return;
  } else {
    showToast("Bunday promokod mavjud emas yoki muddati o'tgan", "warning");
    return;
  }

  renderCart();
}

// Checkout flow
function proceedToCheckout() {
  if (state.cart.length === 0) {
    showToast("Savatchangiz bo'sh!", "warning");
    return;
  }

  const orderNum = Math.floor(10000 + Math.random() * 90000);
  const totalUZS = document.getElementById('cartTotal').textContent;

  // Fire confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  addActivityLog(
    'order_completed', 
    `Buyurtma #${orderNum} muvaffaqiyatli rasmiylashtirildi (${totalUZS})`, 
    'Buyurtma Bajarildi', 
    'emerald'
  );

  state.cart = [];
  state.discountPercent = 0;
  saveCart();
  renderCart();
  updateCartBadge();
  closeCartDrawer();

  showToast(`Rahmat! Buyurtma #${orderNum} qabul qilindi va yetkazib berishga yuborildi!`, 'success');
}

// Product Quick View Modal
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('productDetailModal');
  const content = document.getElementById('productModalContent');
  if (!modal || !content) return;

  const title = product[`title_${state.lang}`] || product.title_uz;
  const desc = product[`desc_${state.lang}`] || product.desc_uz;

  content.innerHTML = `
    <div class="space-y-4">
      <div class="h-60 rounded-xl overflow-hidden bg-slate-900">
        <img src="${product.image}" alt="${title}" class="w-full h-full object-cover">
      </div>
      <div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase text-cyan-400 tracking-wider">${product.category}</span>
          <div class="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <i data-lucide="star" class="w-4 h-4 star-filled"></i>
            <span>${product.rating} (${product.reviewsCount} sharh)</span>
          </div>
        </div>
        <h2 class="text-lg font-bold text-white mt-1">${title}</h2>
        <p class="text-xs text-slate-300 mt-2 leading-relaxed">${desc}</p>
      </div>

      <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-[11px] text-slate-400 block">Narx:</span>
          <span class="text-lg font-black text-emerald-400">${formatUZS(product.price)}</span>
        </div>
        <button onclick="addToCart(${product.id}); closeProductModal();" class="btn-neon px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2">
          <i data-lucide="shopping-cart" class="w-4 h-4"></i>
          <span>Savatchaga Qo'shish</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Admin Modal Management
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  renderAdminProductsList();
  if (window.lucide) lucide.createIcons();
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderAdminProductsList() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;

  container.innerHTML = state.products.map(p => `
    <div class="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2.5 min-w-0">
        <img src="${p.image}" class="w-8 h-8 rounded-lg object-cover bg-slate-950">
        <div class="truncate">
          <h5 class="text-white font-bold truncate">${p.title_uz}</h5>
          <span class="text-[10px] text-emerald-400">${formatUZS(p.price)} • Zaxira: ${p.stock} ta</span>
        </div>
      </div>
      <button onclick="deleteProduct(${p.id})" class="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function handleAddNewProduct(e) {
  e.preventDefault();
  const name = document.getElementById('newProdName').value.trim();
  const cat = document.getElementById('newProdCat').value;
  const price = parseInt(document.getElementById('newProdPrice').value);
  const oldPrice = parseInt(document.getElementById('newProdOldPrice').value) || (price * 1.2);
  const stock = parseInt(document.getElementById('newProdStock').value) || 10;
  const image = document.getElementById('newProdImage').value.trim();

  const newProd = {
    id: Date.now(),
    title_uz: name,
    title_en: name,
    title_ru: name,
    category: cat,
    price: price,
    oldPrice: oldPrice,
    rating: 5.0,
    reviewsCount: 1,
    image: image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW',
    stock: stock,
    desc_uz: `${name} - yuqori sifatli zamonaviy mahsulot.`,
    desc_en: `${name} - high quality premium product.`,
    desc_ru: `${name} - качественный современный товар.`
  };

  state.products.unshift(newProd);
  localStorage.setItem('shopping_products', JSON.stringify(state.products));

  addActivityLog('product_add', `Yangi mahsulot qo'shildi: "${name}"`, 'Yangi Mahsulot', 'emerald');
  renderProducts();
  renderAdminProductsList();
  e.target.reset();
  showToast(`"${name}" mahsuloti katalogga muvaffaqiyatli qo'shildi!`, 'success');
}

function deleteProduct(productId) {
  const prod = state.products.find(p => p.id === productId);
  state.products = state.products.filter(p => p.id !== productId);
  localStorage.setItem('shopping_products', JSON.stringify(state.products));
  renderProducts();
  renderAdminProductsList();
  showToast(`Mahsulot o'chirildi`, 'info');
}

// Review Modal
function openReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleNewReviewSubmit(e) {
  e.preventDefault();
  const author = document.getElementById('reviewAuthor').value.trim();
  const role = document.getElementById('reviewRole').value.trim() || 'Xaridor';
  const rating = parseFloat(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value.trim();

  const newRev = {
    id: Date.now(),
    author,
    role,
    rating,
    date: 'Hozirgina',
    comment_uz: comment,
    comment_en: comment,
    comment_ru: comment,
    avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=120&q=80`,
    verified: true
  };

  state.reviews.unshift(newRev);
  localStorage.setItem('shopping_reviews', JSON.stringify(state.reviews));
  renderReviews();
  addActivityLog('review', `${author} platformaga yangi 5 yulduzli baho qoldirdi`, 'Fikr Bildirildi', 'amber');
  closeReviewModal();
  e.target.reset();
  showToast("Fikringiz uchun tashakkur! Muvaffaqiyatli joylandi.", "success");
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colors = {
    success: 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300',
    warning: 'bg-amber-950/90 border-amber-500/80 text-amber-300',
    info: 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300'
  };

  const icons = {
    success: 'check-circle',
    warning: 'alert-triangle',
    info: 'info'
  };

  const toast = document.createElement('div');
  toast.className = `p-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs font-semibold toast-enter pointer-events-auto transition-all ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
