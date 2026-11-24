const STORAGE_KEYS = {
  SETTINGS: 'svs_settings_v1',
  CATEGORIES: 'svs_categories_v1',
  PRODUCTS: 'svs_products_v1',
  ORDERS: 'svs_orders_v1',
  ENQUIRIES: 'svs_enquiries_v1',
  ADMIN_AUTH: 'svs_admin_logged_in_v1'
};

const DEFAULT_SETTINGS = {
  storeName: 'Sahoo Variety Store & Ayush Enterprises',
  tagline: 'Daily Needs, Govt. Approved Fertilizers & Fair-Value Paddy Procurement',
  address: '3CM5+MWX, Narayanpur, Ganijang, Odisha 756113',
  phonePrimary: '9437735192',
  phoneSecondary: '9439741194',
  whatsappNumber: '919437735192',
  fertLicense: 'FERT/2026DD-22368',
  insecticideLicense: 'INCECTI/2026D-15792',
  paddyRate: 2300,
  paddyActive: true,
  paddyNote: 'Transparent digital weighing, fair grade assessment, and prompt settlement for local farmers.'
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Groceries & Daily Needs', division: 'variety_store' },
  { id: 'cat-2', name: 'Snacks, Biscuits & Cold Drinks', division: 'variety_store' },
  { id: 'cat-3', name: 'Household, Ropes & Fishing Nets', division: 'variety_store' },
  { id: 'cat-4', name: 'Fertilizers (Gromor / Urea)', division: 'agri_inputs' },
  { id: 'cat-5', name: 'Insecticides & Pesticides', division: 'agri_inputs' },
  { id: 'cat-6', name: 'Fungicides & Bio-Stimulants', division: 'agri_inputs' }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'p-1',
    categoryId: 'cat-4',
    name: 'Gromor 28-28-0 Complex Fertilizer',
    brand: 'Coromandel',
    unit: '50 kg Bag',
    price: 1750,
    inStock: true,
    featured: true,
    description: 'Balanced Nitrogen & Phosphate complex fertilizer for strong paddy root and tiller development.',
    image: ''
  },
  {
    id: 'p-2',
    categoryId: 'cat-5',
    name: 'Cannon Insecticide',
    brand: 'Nagarjuna',
    unit: '500 ml Bottle',
    price: 480,
    inStock: true,
    featured: true,
    description: 'Effective broad-spectrum insecticide for stem borer and leaf folder control.',
    image: ''
  },
  {
    id: 'p-3',
    categoryId: 'cat-6',
    name: 'Contaf Plus Systemic Fungicide',
    brand: 'Tata Rallis',
    unit: '500 ml Bottle',
    price: 420,
    inStock: true,
    featured: true,
    description: 'Trusted systemic fungicide for sheath blight and blast protection in paddy.',
    image: ''
  },
  {
    id: 'p-4',
    categoryId: 'cat-5',
    name: 'Ustaad Insecticide',
    brand: 'UPL',
    unit: '250 ml Bottle',
    price: 310,
    inStock: true,
    featured: false,
    description: 'Fast-acting crop protection solution approved under Odisha agriculture standards.',
    image: ''
  },
  {
    id: 'p-5',
    categoryId: 'cat-6',
    name: 'MycoHil Mycorrhizal Bio-Fertilizer',
    brand: 'MycoHil',
    unit: '1 Box',
    price: 260,
    inStock: true,
    featured: false,
    description: 'Enhances nutrient uptake and drought resilience in paddy and vegetable crops.',
    image: ''
  },
  {
    id: 'p-6',
    categoryId: 'cat-1',
    name: 'Daily Kitchen Grocery Essentials Pack',
    brand: 'Sahoo Store Selection',
    unit: 'Assorted',
    price: 250,
    inStock: true,
    featured: true,
    description: 'Cooking oil, pulses, spices, tea, and everyday household staples available fresh.',
    image: ''
  },
  {
    id: 'p-7',
    categoryId: 'cat-3',
    name: 'Heavy-Duty Nylon Fishing Net & Rope',
    brand: 'Standard Rural Grade',
    unit: '1 Bundle',
    price: 350,
    inStock: true,
    featured: false,
    description: 'Durable fishing nets and strong multipurpose nylon ropes stocked in-store.',
    image: ''
  },
  {
    id: 'p-8',
    categoryId: 'cat-3',
    name: 'All-Weather Folding Umbrella',
    brand: 'Monsoon Guard',
    unit: '1 Piece',
    price: 240,
    inStock: true,
    featured: false,
    description: 'Sturdy wind-resistant umbrella for farm and daily travel.',
    image: ''
  }
];

const StoreDB = {
  getSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS };
  },
  saveSettings(data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
  },
  getCategories() {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return [...DEFAULT_CATEGORIES];
    }
    return JSON.parse(saved);
  },
  saveCategories(list) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
  },
  getProducts() {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return [...DEFAULT_PRODUCTS];
    }
    return JSON.parse(saved);
  },
  saveProducts(list) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  },
  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  },
  saveOrders(list) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
  },
  getEnquiries() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ENQUIRIES) || '[]');
  },
  saveEnquiries(list) {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
  }
};