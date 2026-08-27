(() => {
  const products = [
    { id: "p1", name: "晨霧陶杯", category: "生活器物", price: 680, icon: "☕", art: "art-a" },
    { id: "p2", name: "亞麻收納袋", category: "生活器物", price: 420, icon: "▱", art: "art-b" },
    { id: "p3", name: "午後香氛蠟燭", category: "香氛日常", price: 880, icon: "◒", art: "art-c" },
    { id: "p4", name: "山茶沐浴組", category: "香氛日常", price: 760, icon: "✿", art: "art-d" },
    { id: "p5", name: "週末野餐墊", category: "戶外選物", price: 1280, icon: "▰", art: "art-e" },
    { id: "p6", name: "手作木盤", category: "戶外選物", price: 540, icon: "◓", art: "art-f" },
  ];
  const categories = ["全部", ...new Set(products.map((product) => product.category))];
  let activeCategory = "全部";
  let cart = JSON.parse(localStorage.getItem("concept-cart") || "[]");

  const categoryRoot = document.querySelector("#categories");
  const productRoot = document.querySelector("#products");
  const cartItemsRoot = document.querySelector("#cart-items");
  const cartEmpty = document.querySelector("#cart-empty");
  const cartCount = document.querySelector("#cart-count");
  const cartTotal = document.querySelector("#cart-total");
  const checkout = document.querySelector("#checkout");
  const drawer = document.querySelector("#cart-drawer");
  const scrim = document.querySelector("#scrim");
  const toast = document.querySelector("#toast");
  let toastTimer;

  const money = (number) => `NT$${number.toLocaleString("zh-TW")}`;
  const saveCart = () => localStorage.setItem("concept-cart", JSON.stringify(cart));
  const getProduct = (id) => products.find((product) => product.id === id);

  function renderCategories() {
    categoryRoot.innerHTML = categories.map((category) => `
      <button class="category-tab ${category === activeCategory ? "active" : ""}" data-category="${category}" type="button">${category}</button>
    `).join("");
    categoryRoot.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        renderCategories();
        renderProducts();
      });
    });
  }

  function renderProducts() {
    const visible = activeCategory === "全部" ? products : products.filter((product) => product.category === activeCategory);
    productRoot.innerHTML = visible.map((product) => `
      <article class="product-card">
        <div class="product-art ${product.art}" aria-hidden="true">${product.icon}</div>
        <div class="product-body">
          <p class="product-category">${product.category}</p>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-row">
            <span class="product-price">${money(product.price)}</span>
            <button class="add-button" data-add="${product.id}" type="button">加入購物車</button>
          </div>
        </div>
      </article>
    `).join("");
    productRoot.querySelectorAll("[data-add]").forEach((button) => {
      button.addEventListener("click", () => addToCart(button.dataset.add));
    });
  }

  function addToCart(id) {
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, quantity: 1 });
    saveCart();
    renderCart();
    showToast("已加入購物車");
  }

  function updateQuantity(id, delta) {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== id);
    saveCart();
    renderCart();
  }

  function renderCart() {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => {
      const product = getProduct(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    cartCount.textContent = itemCount;
    cartTotal.textContent = money(total);
    checkout.disabled = itemCount === 0;
    cartEmpty.hidden = itemCount !== 0;
    cartItemsRoot.innerHTML = cart.map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
        <div class="cart-item">
          <div class="cart-item-art ${product.art}" aria-hidden="true">${product.icon}</div>
          <div><p class="cart-item-name">${product.name}</p><span class="cart-item-price">${money(product.price)} × ${item.quantity}</span></div>
          <div class="qty"><button data-minus="${product.id}" type="button" aria-label="減少數量">−</button><span>${item.quantity}</span><button data-plus="${product.id}" type="button" aria-label="增加數量">＋</button></div>
        </div>
      `;
    }).join("");
    cartItemsRoot.querySelectorAll("[data-minus]").forEach((button) => button.addEventListener("click", () => updateQuantity(button.dataset.minus, -1)));
    cartItemsRoot.querySelectorAll("[data-plus]").forEach((button) => button.addEventListener("click", () => updateQuantity(button.dataset.plus, 1)));
  }

  function setDrawer(open) {
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    document.querySelector("#open-cart").setAttribute("aria-expanded", String(open));
    scrim.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  document.querySelector("#open-cart").addEventListener("click", () => setDrawer(true));
  document.querySelector("#close-cart").addEventListener("click", () => setDrawer(false));
  scrim.addEventListener("click", () => setDrawer(false));
  checkout.addEventListener("click", () => {
    if (checkout.disabled) return;
    cart = [];
    saveCart();
    renderCart();
    showToast("模擬下單完成：這是概念流程，沒有產生真實訂單");
  });

  renderCategories();
  renderProducts();
  renderCart();
})();
