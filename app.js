const rupiah = n => "Rp" + Number(n).toLocaleString("id-ID");

const defaultProducts = [
  {
    id: 1,
    name: "Nasi Goreng",
    price: 18000,
    stock: 15,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500"
  },
  {
    id: 2,
    name: "Mie Goreng",
    price: 15000,
    stock: 12,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500"
  },
  {
    id: 3,
    name: "Ayam Geprek",
    price: 20000,
    stock: 10,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500"
  },
  {
    id: 4,
    name: "Burger",
    price: 16000,
    stock: 8,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
  },
  {
    id: 5,
    name: "Kentang Goreng",
    price: 12000,
    stock: 20,
    category: "Camilan",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500"
  },
  {
    id: 6,
    name: "Es Teh Manis",
    price: 5000,
    stock: 25,
    category: "Minuman",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
  }
];

let products = JSON.parse(localStorage.getItem("posProducts")) || defaultProducts;
let cart = [];
let transactions = JSON.parse(localStorage.getItem("posTransactions")) || [];
let selectedImageData = null;

function saveData() {
  try {
    localStorage.setItem("posProducts", JSON.stringify(products));
    localStorage.setItem("posTransactions", JSON.stringify(transactions));
    return true;
  } catch (error) {
    alert("Penyimpanan penuh. Coba gunakan foto yang lebih kecil.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showPage(page, element) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(page);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
  });

  if (element) {
    element.classList.add("active");
  } else {
    const navLink = document.querySelector(
      '.nav-link[onclick*="' + page + '"]'
    );

    if (navLink) navLink.classList.add("active");
  }

  if (page === "products") renderProducts();
  if (page === "manage") renderManage();
  if (page === "cart") renderCart();
  if (page === "checkout") updateCheckout();
  if (page === "history") renderHistory();

  const menu = document.getElementById("navbarMenu");

  if (menu.classList.contains("show")) {
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }

  window.scrollTo(0, 0);
}

function getStockBadge(stock) {
  if (stock === 0) {
    return '<span class="badge badge-empty">Stok Habis</span>';
  }

  if (stock < 5) {
    return '<span class="badge badge-low">Stok Menipis</span>';
  }

  return '<span class="badge badge-safe">Stok Aman</span>';
}

function productCard(p) {
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card">
        <img
          src="${escapeHTML(p.image)}"
          class="product-img"
          alt="${escapeHTML(p.name)}"
          onerror="this.src='https://placehold.co/500x300/ffe3ef/bd5e8d?text=Mini+POS'"
        >

        <div class="product-body">
          <h6 class="fw-bold">${escapeHTML(p.name)}</h6>
          <p class="text-muted small mb-1">${escapeHTML(p.category || "Makanan")}</p>
          <p class="metric-value mb-2">${rupiah(p.price)}</p>
          <p class="mb-2">Stok: ${p.stock}</p>

          ${getStockBadge(p.stock)}

          <button
            class="btn btn-pink btn-sm w-100 mt-3"
            onclick="addToCart(${p.id})"
            ${p.stock === 0 ? "disabled" : ""}
          >
            ${p.stock === 0 ? "Stok Habis" : "Beli"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderProducts() {
  const keyword = document.getElementById("searchProduct").value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(keyword)
  );

  document.getElementById("productList").innerHTML =
    filtered.length
      ? filtered.map(productCard).join("")
      : '<p class="text-center">Produk tidak ditemukan 💗</p>';
}

function renderHome() {
  document.getElementById("homeProducts").innerHTML =
    products.slice(0, 4).map(productCard).join("");
}

function renderManage() {
  document.getElementById("manageList").innerHTML = products.length
    ? products.map(p => `
      <tr>
        <td>${escapeHTML(p.name)}</td>
        <td>${rupiah(p.price)}</td>
        <td>${p.stock}</td>
        <td>${escapeHTML(p.category || "Makanan")}</td>
        <td>
          <button
            class="btn btn-sm btn-outline-pink mb-1"
            onclick="editProduct(${p.id})"
          >Edit</button>

          <button
            class="btn btn-sm btn-danger mb-1"
            onclick="deleteProduct(${p.id})"
          >Hapus</button>
        </td>
      </tr>
    `).join("")
    : '<tr><td colspan="5" class="text-center">Belum ada produk.</td></tr>';
}

function previewSelectedImage() {
  const file = document.getElementById("productImage").files[0];
  const preview = document.getElementById("imagePreview");

  if (!file) {
    selectedImageData = null;
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Silakan pilih file gambar!");
    document.getElementById("productImage").value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const image = new Image();

    image.onload = function() {
      const canvas = document.createElement("canvas");
      const maxSize = 700;

      let width = image.width;
      let height = image.height;

      if (width > height && width > maxSize) {
        height = height * maxSize / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = width * maxSize / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, width, height);

      selectedImageData = canvas.toDataURL("image/jpeg", 0.7);

      preview.src = selectedImageData;
      preview.style.display = "inline-block";
    };

    image.src = e.target.result;
  };

  reader.onerror = function() {
    alert("Gagal membaca foto. Silakan coba lagi.");
  };

  reader.readAsDataURL(file);
}

document.getElementById("productImage").addEventListener(
  "change",
  previewSelectedImage
);

document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const name = document.getElementById("productName").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const stock = Number(document.getElementById("productStock").value);
  const category = document.getElementById("productCategory").value;

  if (!name || price <= 0 || stock < 0) {
    alert("Periksa kembali data produk!");
    return;
  }

  if (!id && !selectedImageData) {
    alert("Silakan pilih foto produk dari galeri terlebih dahulu!");
    return;
  }

  if (id) {
    const product = products.find(p => p.id === Number(id));

    if (!product) return;

    const oldProduct = {...product};

    product.name = name;
    product.price = price;
    product.stock = stock;
    product.category = category;

    if (selectedImageData) {
      product.image = selectedImageData;
    }

    if (!saveData()) {
      Object.assign(product, oldProduct);
      return;
    }

  } else {
    const newProduct = {
      id: Date.now(),
      name,
      price,
      stock,
      category,
      image: selectedImageData
    };

    products.push(newProduct);

    if (!saveData()) {
      products.pop();
      return;
    }
  }

  resetForm();
  renderAll();

  alert("Produk berhasil disimpan! 💗");
});

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").textContent = "Tambah Produk Baru";

  const preview = document.getElementById("imagePreview");

  preview.src = "";
  preview.style.display = "none";

  document.getElementById("productImage").required = true;

  selectedImageData = null;
}

function editProduct(id) {
  const p = products.find(item => item.id === id);

  if (!p) return;

  document.getElementById("editId").value = p.id;
  document.getElementById("productName").value = p.name;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("productStock").value = p.stock;
  document.getElementById("productCategory").value = p.category || "Makanan";

  document.getElementById("productImage").value = "";
  document.getElementById("productImage").required = false;

  selectedImageData = null;

  const preview = document.getElementById("imagePreview");

  preview.src = p.image;
  preview.style.display = "inline-block";

  document.getElementById("formTitle").textContent = "Edit Produk";

  window.scrollTo(0, 0);
}

function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) return;

  const oldProducts = [...products];
  const oldCart = [...cart];

  products = products.filter(p => p.id !== id);
  cart = cart.filter(p => p.id !== id);

  if (!saveData()) {
    products = oldProducts;
    cart = oldCart;
    return;
  }

  renderAll();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);

  if (!product || product.stock <= 0) return;

  const item = cart.find(p => p.id === id);

  if (item) {
    if (item.quantity >= product.stock) {
      alert("Jumlah melebihi stok tersedia!");
      return;
    }

    item.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCart();
  renderProducts();
  renderHome();
}

function getTotal() {
  return cart.reduce((sum, item) =>
    sum + item.price * item.quantity, 0
  );
}

function renderCart() {
  const list = document.getElementById("cartList");

  if (!cart.length) {
    list.innerHTML =
      '<tr><td colspan="5" class="text-center">Keranjang masih kosong 💗</td></tr>';
  } else {
    list.innerHTML = cart.map(item => `
      <tr>
        <td>${escapeHTML(item.name)}</td>
        <td>${rupiah(item.price)}</td>
        <td>
          <button class="btn btn-sm btn-outline-pink"
          onclick="changeQuantity(${item.id},-1)">−</button>

          ${item.quantity}

          <button class="btn btn-sm btn-outline-pink"
          onclick="changeQuantity(${item.id},1)">+</button>
        </td>
        <td>${rupiah(item.price * item.quantity)}</td>
        <td>
          <button class="btn btn-sm btn-danger"
          onclick="removeCart(${item.id})">Hapus</button>
        </td>
      </tr>
    `).join("");
  }

  document.getElementById("cartTotal").textContent = rupiah(getTotal());
  document.getElementById("checkoutButton").disabled = cart.length === 0;
}

function changeQuantity(id, amount) {
  const item = cart.find(p => p.id === id);
  const product = products.find(p => p.id === id);

  if (!item || !product) return;

  const newQuantity = item.quantity + amount;

  if (newQuantity <= 0) {
    removeCart(id);
    return;
  }

  if (newQuantity > product.stock) {
    alert("Stok tidak mencukupi!");
    return;
  }

  item.quantity = newQuantity;
  renderCart();
}

function removeCart(id) {
  cart = cart.filter(p => p.id !== id);
  renderCart();
}

function goCheckout() {
  if (!cart.length) {
    alert("Keranjang masih kosong!");
    return;
  }

  showPage("checkout");
}

function updateCheckout() {
  document.getElementById("checkoutTotal").textContent = rupiah(getTotal());
  document.getElementById("cashAmount").value = "";

  document.getElementById("paymentMessage").textContent =
    "Masukkan uang pembayaran.";

  document.getElementById("changeAmount").textContent = rupiah(0);

  updatePayment();
}

function updatePayment() {
  const method = document.getElementById("paymentMethod").value;

  document.getElementById("cashArea").classList.toggle(
    "d-none", method !== "Tunai"
  );

  document.getElementById("otherPayment").classList.toggle(
    "d-none", method === "Tunai"
  );

  document.getElementById("payButton").disabled = cart.length === 0;

  if (method !== "Tunai") {
    document.getElementById("otherPayment").textContent =
      "Pembayaran " + method +
      " merupakan simulasi untuk tugas sekolah.";
  }
}

function calculateChange() {
  const total = getTotal();
  const cash = Number(document.getElementById("cashAmount").value);
  const message = document.getElementById("paymentMessage");
  const button = document.getElementById("payButton");

  if (cash >= total && total > 0) {
    message.textContent = "Pembayaran mencukupi! 💗";
    message.style.color = "green";

    document.getElementById("changeAmount").textContent =
      rupiah(cash - total);

    button.disabled = false;
  } else {
    message.textContent = cash > 0
      ? "Uang pembayaran masih kurang."
      : "Masukkan uang pembayaran.";

    message.style.color = "#c52e50";

    document.getElementById("changeAmount").textContent = rupiah(0);

    button.disabled = true;
  }
}

function completePayment() {
  if (!cart.length) {
    alert("Keranjang masih kosong!");
    return;
  }

  const method = document.getElementById("paymentMethod").value;
  const total = getTotal();

  const cash = method === "Tunai"
    ? Number(document.getElementById("cashAmount").value)
    : total;

  if (method === "Tunai" && cash < total) {
    alert("Uang pembayaran masih kurang!");
    return;
  }

  for (const item of cart) {
    const product = products.find(p => p.id === item.id);

    if (!product || product.stock < item.quantity) {
      alert("Stok " + item.name + " tidak mencukupi!");
      return;
    }
  }

  const oldProducts = JSON.parse(JSON.stringify(products));

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    product.stock -= item.quantity;
  });

  const now = new Date();

  const transaction = {
    number: "POS-" + Date.now(),
    date: now.toLocaleDateString("id-ID"),
    time: now.toLocaleTimeString("id-ID"),
    method,
    total,
    cash,
    change: cash - total,
    items: cart.map(item => ({...item}))
  };

  transactions.push(transaction);

  if (!saveData()) {
    products = oldProducts;
    transactions.pop();
    return;
  }

  document.getElementById("receiptNumber").textContent = transaction.number;

  document.getElementById("receiptDate").textContent =
    transaction.date + " " + transaction.time;

  document.getElementById("receiptMethod").textContent = method;

  document.getElementById("receiptItems").innerHTML =
    transaction.items.map(item => `
      <div class="d-flex justify-content-between mb-2">
        <span>${escapeHTML(item.name)} x${item.quantity}</span>
        <span>${rupiah(item.price * item.quantity)}</span>
      </div>
    `).join("");

  document.getElementById("receiptTotal").textContent = rupiah(total);
  document.getElementById("receiptCash").textContent = rupiah(cash);
  document.getElementById("receiptChange").textContent =
    rupiah(transaction.change);

  cart = [];

  renderAll();
  showPage("receipt");
}

function renderHistory() {
  const list = document.getElementById("historyList");

  list.innerHTML = transactions.length
    ? [...transactions].reverse().map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(t.date)} ${escapeHTML(t.time)}</td>
        <td>${escapeHTML(t.method)}</td>
        <td>${rupiah(t.total)}</td>
      </tr>
    `).join("")
    : '<tr><td colspan="4" class="text-center">Belum ada transaksi.</td></tr>';
}

function updateDashboard() {
  const today = new Date().toLocaleDateString("id-ID");

  const todayTransactions = transactions.filter(t =>
    t.date === today
  );

  const revenue = todayTransactions.reduce((sum, t) =>
    sum + t.total, 0
  );

  const stock = products.reduce((sum, p) =>
    sum + p.stock, 0
  );

  document.getElementById("totalRevenue").textContent = rupiah(revenue);
  document.getElementById("totalStock").textContent = stock;
  document.getElementById("totalTransactions").textContent =
    todayTransactions.length;
}

function renderAll() {
  renderProducts();
  renderHome();
  renderManage();
  renderCart();
  renderHistory();
  updateDashboard();
}

renderAll();
