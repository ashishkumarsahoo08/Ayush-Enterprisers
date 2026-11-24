document.addEventListener('DOMContentLoaded', () => {
  const settings = StoreDB.getSettings();
  const categories = StoreDB.getCategories();
  const products = StoreDB.getProducts();

  let activeDivision = 'all';
  let cart = [];

  // Populate Settings across Page
  document.getElementById('topFertLic').textContent = settings.fertLicense;
  document.getElementById('topPestLic').textContent = settings.insecticideLicense;
  document.getElementById('trustFertLic').textContent = settings.fertLicense;
  document.getElementById('trustPestLic').textContent = settings.insecticideLicense;
  document.getElementById('footFertLic').textContent = settings.fertLicense;
  document.getElementById('footPestLic').textContent = settings.insecticideLicense;

  document.getElementById('topPhone1').textContent = settings.phonePrimary;
  document.getElementById('topPhone1').href = `tel:+91${settings.phonePrimary}`;
  document.getElementById('topPhone2').textContent = settings.phoneSecondary;
  document.getElementById('topPhone2').href = `tel:+91${settings.phoneSecondary}`;
  document.getElementById('footerPhones').textContent = `${settings.phonePrimary} / ${settings.phoneSecondary}`;
  document.getElementById('footerAddress').textContent = settings.address;
  document.getElementById('footerTagline').textContent = settings.tagline;

  document.getElementById('heroPaddyRate').textContent = settings.paddyRate;
  document.getElementById('calcRateDisplay').textContent = settings.paddyRate;
  document.getElementById('heroPaddyStatus').textContent = settings.paddyActive ? 'OPEN' : 'SEASONAL';
  document.getElementById('paddyNoteText').textContent = settings.paddyNote;

  // Populate Category Dropdown
  const categoryFilter = document.getElementById('categoryFilter');
  function populateCategories() {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories
      .filter(c => activeDivision === 'all' || c.division === activeDivision)
      .forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        categoryFilter.appendChild(opt);
      });
  }
  populateCategories();

  // Render Product Grid
  const productGrid = document.getElementById('productGrid');
  function renderProducts() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const selectedCat = categoryFilter.value;
    const sortMode = document.getElementById('sortFilter').value;
    const inStockOnly = document.getElementById('inStockFilter').checked;

    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

    let filtered = products.filter(p => {
      const cat = catMap[p.categoryId];
      if (activeDivision !== 'all' && cat?.division !== activeDivision) return false;
      if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
      if (inStockOnly && !p.inStock) return false;
      if (query) {
        const match =
          p.name.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });

    if (sortMode === 'price_asc') {
      filtered.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    } else if (sortMode === 'price_desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    if (filtered.length === 0) {
      productGrid.innerHTML = `<div class="card" style="grid-column:1/-1; text-align:center;">
        <p><strong>No matching items found.</strong></p>
        <p style="font-size:0.85rem; color:var(--muted); margin-top:0.25rem;">
          Call us directly at ${settings.phonePrimary} — we stock many more items in our Narayanpur store.
        </p>
      </div>`;
      return;
    }

    productGrid.innerHTML = filtered
      .map(p => {
        const catName = catMap[p.categoryId]?.name || 'Store Item';
        const thumbHtml = p.image
          ? `<img src="${p.image}" alt="${p.name}" />`
          : `<div class="product-thumb-placeholder">${catName}</div>`;

        return `
          <article class="product-card">
            <div>
              <div class="product-thumb" onclick="openProductModal('${p.id}')">
                ${thumbHtml}
                <span class="stock-badge ${p.inStock ? 'stock-in' : 'stock-out'}">
                  ${p.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div class="product-body">
                <div class="product-cat">${catName}</div>
                <h3 class="product-title" onclick="openProductModal('${p.id}')">${p.name}</h3>
                <p class="product-meta">${p.brand ? p.brand + ' • ' : ''}Unit: ${p.unit}</p>
              </div>
            </div>
            <div class="product-footer">
              <span class="price">${p.price ? '₹' + p.price : 'Ask Rate'}</span>
              <button class="btn btn-primary btn-sm" ${!p.inStock ? 'disabled' : ''} onclick="addToCart('${p.id}')">
                ${p.inStock ? '+ Add' : 'Unavailable'}
              </button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  // Division Tabs
  document.querySelectorAll('#divisionTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#divisionTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDivision = btn.dataset.division;
      populateCategories();
      renderProducts();
    });
  });

  document.getElementById('searchInput').addEventListener('input', renderProducts);
  categoryFilter.addEventListener('change', renderProducts);
  document.getElementById('sortFilter').addEventListener('change', renderProducts);
  document.getElementById('inStockFilter').addEventListener('change', renderProducts);

  // Product Detail Modal
  const productModal = document.getElementById('productModal');
  window.openProductModal = function (id) {
    const p = products.find(item => item.id === id);
    if (!p) return;
    const cat = categories.find(c => c.id === p.categoryId);
    document.getElementById('modalCat').textContent = cat ? cat.name : 'Store Item';
    document.getElementById('modalTitle').textContent = p.name;
    document.getElementById('modalMeta').textContent = `${p.brand ? 'Brand: ' + p.brand + ' • ' : ''}Pack Size: ${p.unit}`;
    document.getElementById('modalDesc').textContent = p.description || 'Available at Sahoo Variety Store & Ayush Enterprises.';
    document.getElementById('modalPrice').textContent = p.price ? `₹${p.price}` : 'Confirm Rate at Store';
    document.getElementById('modalImageWrap').innerHTML = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%; height:200px; object-fit:cover; border-radius:10px;" />`
      : '';

    const addBtn = document.getElementById('modalAddBtn');
    addBtn.disabled = !p.inStock;
    addBtn.textContent = p.inStock ? '+ Add to Order List' : 'Currently Out of Stock';
    addBtn.onclick = () => {
      addToCart(p.id);
      productModal.classList.remove('open');
      cartDrawer.classList.add('open');
    };
    productModal.classList.add('open');
  };
  document.getElementById('closeModalBtn').onclick = () => productModal.classList.remove('open');

  // Cart Logic
  const cartDrawer = document.getElementById('cartDrawer');
  document.getElementById('openCartBtn').onclick = () => cartDrawer.classList.add('open');
  document.getElementById('closeCartBtn').onclick = () => cartDrawer.classList.remove('open');

  window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    if (!product || !product.inStock) return;
    const existing = cart.find(c => c.product.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ product, qty: 1 });
    renderCart();
  };

  window.changeCartQty = function (id, delta) {
    cart = cart
      .map(item => (item.product.id === id ? { ...item, qty: item.qty + delta } : item))
      .filter(item => item.qty > 0);
    renderCart();
  };

  function renderCart() {
    const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const totalAmount = cart.reduce((sum, i) => sum + (i.product.price || 0) * i.qty, 0);

    document.getElementById('cartBadge').textContent = totalCount;
    document.getElementById('cartTotalDisplay').textContent = `₹${totalAmount.toFixed(2)}`;

    const container = document.getElementById('cartItemsContainer');
    if (cart.length === 0) {
      container.innerHTML = '<p style="color:var(--muted); font-size:0.88rem; padding:2rem 0; text-align:center;">Your order list is empty.</p>';
      return;
    }

    container.innerHTML = cart
      .map(
        item => `
        <div class="cart-row">
          <div>
            <strong style="font-size:0.88rem;">${item.product.name}</strong>
            <div style="font-size:0.75rem; color:var(--muted);">
              ${item.product.unit} • ${item.product.price ? '₹' + item.product.price : 'Ask Rate'}
            </div>
          </div>
          <div class="qty-controls">
            <button type="button" class="btn btn-outline btn-sm" onclick="changeCartQty('${item.product.id}', -1)">-</button>
            <strong style="min-width:18px; text-align:center; font-size:0.85rem;">${item.qty}</strong>
            <button type="button" class="btn btn-outline btn-sm" onclick="changeCartQty('${item.product.id}', 1)">+</button>
          </div>
        </div>
      `
      )
      .join('');
  }

  // WhatsApp Order Submission
  document.getElementById('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    if (cart.length === 0) return;

    const name = document.getElementById('orderCustName').value.trim();
    const phone = document.getElementById('orderCustPhone').value.trim();
    const village = document.getElementById('orderCustVillage').value.trim();
    const totalAmount = cart.reduce((sum, i) => sum + (i.product.price || 0) * i.qty, 0);

    // Save to Admin Orders
    const orders = StoreDB.getOrders();
    orders.unshift({
      id: 'ORD-' + Date.now().toString().slice(-5),
      customerName: name,
      customerPhone: phone,
      village,
      items: cart.map(c => ({ name: c.product.name, unit: c.product.unit, qty: c.qty, price: c.product.price })),
      totalAmount,
      status: 'pending',
      createdAt: new Date().toLocaleString()
    });
    StoreDB.saveOrders(orders);

    // Prepare WhatsApp Text
    const lines = cart.map(
      (c, idx) =>
        `${idx + 1}. *${c.product.name}* (${c.product.unit}) x ${c.qty} = ${
          c.product.price ? '₹' + c.product.price * c.qty : 'Confirm Rate'
        }`
    );

    const message = [
      `*New Order — ${settings.storeName}*`,
      `Customer: ${name}`,
      `Phone: ${phone}`,
      village ? `Village: ${village}` : '',
      `--------------------------`,
      ...lines,
      `--------------------------`,
      `*Estimated Total: ₹${totalAmount.toFixed(2)}*`,
      `Please confirm availability and pickup time.`
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  });

  // Paddy Value Calculator
  const quintalInput = document.getElementById('quintalInput');
  function updatePaddyCalc() {
    const q = parseFloat(quintalInput.value) || 0;
    const total = q * settings.paddyRate;
    document.getElementById('estimatedPaddyValue').textContent = `₹${total.toLocaleString('en-IN')}`;
  }
  quintalInput.addEventListener('input', updatePaddyCalc);
  updatePaddyCalc();

  // Enquiry / Paddy Booking Form
  document.getElementById('enquiryForm').addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('enqType').value;
    const name = document.getElementById('enqName').value.trim();
    const phone = document.getElementById('enqPhone').value.trim();
    const village = document.getElementById('enqVillage').value.trim();
    const msg = document.getElementById('enqMessage').value.trim();

    const enquiries = StoreDB.getEnquiries();
    enquiries.unshift({
      id: 'ENQ-' + Date.now().toString().slice(-5),
      type,
      name,
      phone,
      village,
      message: msg || (type === 'paddy_sell' ? `Approx ${quintalInput.value} quintals paddy ready.` : 'Store enquiry'),
      resolved: false,
      createdAt: new Date().toLocaleString()
    });
    StoreDB.saveEnquiries(enquiries);

    e.target.reset();
    const feedback = document.getElementById('enqFeedback');
    feedback.style.color = 'var(--success)';
    feedback.textContent = 'Thank you! Your request has been saved for the shop owner.';
  });

  renderProducts();
  renderCart();
});