document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');

  function checkAuth() {
    const isAuth = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    loginView.style.display = isAuth ? 'none' : 'grid';
    dashboardView.style.display = isAuth ? 'block' : 'none';
    if (isAuth) initDashboard();
  }

  document.getElementById('adminLoginForm').addEventListener('submit', e => {
    e.preventDefault();
    const pass = document.getElementById('adminPassInput').value;
    if (pass === 'Aayush0408') {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      checkAuth();
    } else {
      document.getElementById('loginError').textContent = 'Invalid password. ';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    checkAuth();
  });

  // Tab Switching
  document.querySelectorAll('#adminTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#adminTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => (p.style.display = 'none'));
      document.getElementById(btn.dataset.tab).style.display =
        btn.dataset.tab === 'productsTab' ? 'grid' : 'block';
    });
  });

  function initDashboard() {
    renderCategoryOptions();
    renderProductTable();
    renderOrdersTable();
    renderEnquiriesTable();
    loadSettingsForm();
  }

  function renderCategoryOptions() {
    const cats = StoreDB.getCategories();
    const sel = document.getElementById('pCategory');
    sel.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  // Add Category
  document.getElementById('categoryForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('newCatName').value.trim();
    const division = document.getElementById('newCatDiv').value;
    if (!name) return;
    const cats = StoreDB.getCategories();
    cats.push({ id: 'cat-' + Date.now(), name, division });
    StoreDB.saveCategories(cats);
    e.target.reset();
    renderCategoryOptions();
  });

  // Save / Edit Product
  let uploadedBase64 = '';
  document.getElementById('pImageFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (uploadedBase64 = reader.result);
    reader.readAsDataURL(file);
  });

  document.getElementById('productForm').addEventListener('submit', e => {
    e.preventDefault();
    const products = StoreDB.getProducts();
    const editId = document.getElementById('editProdId').value;
    const existing = products.find(p => p.id === editId);

    const productObj = {
      id: editId || 'p-' + Date.now(),
      name: document.getElementById('pName').value.trim(),
      brand: document.getElementById('pBrand').value.trim(),
      unit: document.getElementById('pUnit').value.trim(),
      categoryId: document.getElementById('pCategory').value,
      price: document.getElementById('pPrice').value ? parseFloat(document.getElementById('pPrice').value) : null,
      description: document.getElementById('pDesc').value.trim(),
      inStock: document.getElementById('pInStock').checked,
      featured: document.getElementById('pFeatured').checked,
      image: uploadedBase64 || (existing ? existing.image : '')
    };

    if (editId) {
      const idx = products.findIndex(p => p.id === editId);
      if (idx > -1) products[idx] = productObj;
    } else {
      products.unshift(productObj);
    }

    StoreDB.saveProducts(products);
    resetProdForm();
    renderProductTable();
  });

  function resetProdForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editProdId').value = '';
    document.getElementById('prodFormTitle').textContent = 'Add New Product';
    document.getElementById('cancelEditBtn').style.display = 'none';
    uploadedBase64 = '';
  }
  document.getElementById('cancelEditBtn').addEventListener('click', resetProdForm);

  window.editProduct = function (id) {
    const p = StoreDB.getProducts().find(item => item.id === id);
    if (!p) return;
    document.getElementById('editProdId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pBrand').value = p.brand || '';
    document.getElementById('pUnit').value = p.unit;
    document.getElementById('pCategory').value = p.categoryId;
    document.getElementById('pPrice').value = p.price || '';
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('pInStock').checked = p.inStock;
    document.getElementById('pFeatured').checked = p.featured;
    document.getElementById('prodFormTitle').textContent = 'Edit Product';
    document.getElementById('cancelEditBtn').style.display = 'inline-flex';
  };

  window.toggleStock = function (id) {
    const products = StoreDB.getProducts();
    const p = products.find(item => item.id === id);
    if (p) {
      p.inStock = !p.inStock;
      StoreDB.saveProducts(products);
      renderProductTable();
    }
  };

  window.deleteProduct = function (id) {
    if (!confirm('Delete this product?')) return;
    const updated = StoreDB.getProducts().filter(p => p.id !== id);
    StoreDB.saveProducts(updated);
    renderProductTable();
  };

  function renderProductTable() {
    const products = StoreDB.getProducts();
    const cats = Object.fromEntries(StoreDB.getCategories().map(c => [c.id, c.name]));
    document.getElementById('adminProductTable').innerHTML = products
      .map(
        p => `
        <tr>
          <td>
            <strong>${p.name}</strong><br />
            <small style="color:var(--muted);">${cats[p.categoryId] || ''} • ${p.unit}</small>
          </td>
          <td>${p.price ? '₹' + p.price : 'Ask Rate'}</td>
          <td>
            <button class="btn btn-sm ${p.inStock ? 'stock-in' : 'stock-out'}" onclick="toggleStock('${p.id}')">
              ${p.inStock ? 'In Stock' : 'Out'}
            </button>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="editProduct('${p.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Del</button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  function renderOrdersTable() {
    const orders = StoreDB.getOrders();
    const tbody = document.getElementById('adminOrdersTable');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No orders received yet.</td></tr>';
      return;
    }
    tbody.innerHTML = orders
      .map(
        o => `
        <tr>
          <td><strong>${o.id}</strong><br /><small>${o.createdAt}</small></td>
          <td>${o.customerName}<br /><small>${o.customerPhone} ${o.village ? '(' + o.village + ')' : ''}</small></td>
          <td>${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</td>
          <td><strong>₹${o.totalAmount}</strong></td>
          <td>
            <select onchange="updateOrderStatus('${o.id}', this.value)">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
        </tr>
      `
      )
      .join('');
  }

  window.updateOrderStatus = function (id, status) {
    const orders = StoreDB.getOrders();
    const o = orders.find(item => item.id === id);
    if (o) {
      o.status = status;
      StoreDB.saveOrders(orders);
    }
  };

  function renderEnquiriesTable() {
    const list = StoreDB.getEnquiries();
    const tbody = document.getElementById('adminEnquiriesTable');
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No enquiries or paddy bookings yet.</td></tr>';
      return;
    }
    tbody.innerHTML = list
      .map(
        e => `
        <tr>
          <td><strong>${e.type.toUpperCase()}</strong><br /><small>${e.createdAt}</small></td>
          <td>${e.name}<br /><small>${e.phone} ${e.village ? '(' + e.village + ')' : ''}</small></td>
          <td>${e.message}</td>
          <td>
            <button class="btn btn-sm ${e.resolved ? 'btn-outline' : 'btn-primary'}" onclick="toggleEnq('${e.id}')">
              ${e.resolved ? 'Done' : 'Mark Resolved'}
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  window.toggleEnq = function (id) {
    const list = StoreDB.getEnquiries();
    const item = list.find(e => e.id === id);
    if (item) {
      item.resolved = !item.resolved;
      StoreDB.saveEnquiries(list);
      renderEnquiriesTable();
    }
  };

  function loadSettingsForm() {
    const s = StoreDB.getSettings();
    document.getElementById('setPaddyRate').value = s.paddyRate;
    document.getElementById('setPaddyActive').checked = s.paddyActive;
    document.getElementById('setPaddyNote').value = s.paddyNote;
    document.getElementById('setPhone1').value = s.phonePrimary;
    document.getElementById('setWhatsapp').value = s.whatsappNumber;
  }

  document.getElementById('settingsForm').addEventListener('submit', e => {
    e.preventDefault();
    const s = StoreDB.getSettings();
    s.paddyRate = parseFloat(document.getElementById('setPaddyRate').value) || 2300;
    s.paddyActive = document.getElementById('setPaddyActive').checked;
    s.paddyNote = document.getElementById('setPaddyNote').value.trim();
    s.phonePrimary = document.getElementById('setPhone1').value.trim();
    s.whatsappNumber = document.getElementById('setWhatsapp').value.trim();
    StoreDB.saveSettings(s);
    document.getElementById('settingsSavedMsg').textContent = 'Settings Saved!';
  });

  checkAuth();
});