'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
  Layers,
  Tag,
  Upload,
  Link as LinkIcon,
  Flame,
  Percent,
  X,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { IOrder, IProduct, ISupplier, ICategory, ICoupon, OrderStatus } from '@/types';

type AdminTab =
  | 'inventory'
  | 'orders'
  | 'categories'
  | 'suppliers'
  | 'bestselling'
  | 'offers'
  | 'alerts'
  | 'overview';

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Low stock threshold
  const LOW_STOCK_THRESHOLD = 5;

  // Order modal state
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus>('Paid');
  const [supplierRefInput, setSupplierRefInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingCarrierInput, setTrackingCarrierInput] = useState('Bluedart Express');
  const [savingOrder, setSavingOrder] = useState(false);

  // Product modal state (Add / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductSlug, setEditingProductSlug] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Costume');
  const [prodPrice, setProdPrice] = useState('899');
  const [prodOrigPrice, setProdOrigPrice] = useState('1499');
  const [prodStock, setProdStock] = useState('25');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSupplierId, setProdSupplierId] = useState('sup_1');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodSizes, setProdSizes] = useState('S, M, L, XL');
  
  // Image handling in product modal: Device Upload vs URL
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('/images/categories/costume.png');
  const [catImageMode, setCatImageMode] = useState<'upload' | 'url'>('url');
  const [savingCategory, setSavingCategory] = useState(false);

  // Supplier modal state
  const [supModalOpen, setSupModalOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupLeadTime, setNewSupLeadTime] = useState('3');
  const [newSupNotes, setNewSupNotes] = useState('');
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Coupon modal state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState('15');
  const [newCouponMin, setNewCouponMin] = useState('999');
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Quick feedback toast / message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, prodsRes, suppRes, catRes, coupRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/admin/suppliers'),
        fetch('/api/categories'),
        fetch('/api/coupons'),
      ]);

      const [statsData, ordersData, prodsData, suppData, catData, coupData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        prodsRes.json(),
        suppRes.json(),
        catRes.json(),
        coupRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setOrders(ordersData.orders);
      if (prodsData.success) setProducts(prodsData.products);
      if (suppData.success) setSuppliers(suppData.suppliers);
      if (catData.success) setCategories(catData.categories);
      if (coupData.success) setCoupons(coupData.coupons);
    } catch (e) {
      console.error('Error fetching admin info', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Compute stock alert metrics
  const outOfStockProducts = products.filter((p) => p.stock <= 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
  const totalStockAlerts = outOfStockProducts.length + lowStockProducts.length;

  const pendingFulfillmentOrders = orders.filter(
    (o) => o.orderStatus === 'Paid' || o.orderStatus === 'Processing'
  );
  const totalAlertCount = totalStockAlerts + pendingFulfillmentOrders.length;

  // Handle Image File Upload from Device
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProductImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Handle Category Image Device Upload
  const handleCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewCatImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Image URL to Product Images list
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setProductImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const removeProductImage = (idxToRemove: number) => {
    setProductImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Open modal to Add Product
  const handleOpenAddProduct = () => {
    setEditingProductSlug(null);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Costume');
    setProdPrice('899');
    setProdOrigPrice('1499');
    setProdStock('20');
    setProdDesc('');
    setProdSupplierId(suppliers[0]?._id || 'sup_1');
    setProdIsFeatured(false);
    setProdSizes('S, M, L, XL');
    setProductImages([]);
    setImageUrlInput('');
    setProductModalOpen(true);
  };

  // Open modal to Edit Product
  const handleOpenEditProduct = (p: IProduct) => {
    setEditingProductSlug(p.slug);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(String(p.price));
    setProdOrigPrice(p.originalPrice ? String(p.originalPrice) : '');
    setProdStock(String(p.stock));
    setProdDesc(p.description || '');
    setProdSupplierId(p.supplierId || 'sup_1');
    setProdIsFeatured(Boolean(p.isFeatured));
    setProdSizes(p.variants?.sizes?.join(', ') || 'S, M, L, XL');
    setProductImages(p.images || []);
    setImageUrlInput('');
    setProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;
    setSavingProduct(true);

    const sizesArr = prodSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const imagesToSave =
      productImages.length > 0 ? productImages : ['/images/products/oversized-tshirt.png'];

    const payload = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      originalPrice: prodOrigPrice ? Number(prodOrigPrice) : undefined,
      description: prodDesc,
      stock: Number(prodStock) || 0,
      images: imagesToSave,
      variants: { sizes: sizesArr.length > 0 ? sizesArr : ['Standard'] },
      supplierId: prodSupplierId,
      isFeatured: prodIsFeatured,
    };

    try {
      if (editingProductSlug) {
        // Update existing
        const res = await fetch(`/api/products/${editingProductSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Product "${prodName}" updated successfully!`);
        }
      } else {
        // Create new
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`New product "${prodName}" added to catalog!`);
        }
      }

      setProductModalOpen(false);
      fetchAdminData();
    } catch (e) {
      console.error('Error saving product', e);
      alert('Failed to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  // Quick Restock Product
  const handleQuickRestock = async (product: IProduct, addQty: number) => {
    const newStock = Math.max(0, product.stock + addQty);
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stock updated: ${product.name} now has ${newStock} units`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Best Selling / Featured
  const handleToggleBestSelling = async (product: IProduct) => {
    const updatedFeatured = !product.isFeatured;
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: updatedFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          updatedFeatured
            ? `⭐ "${product.name}" marked as Best Selling!`
            : `Removed "${product.name}" from Best Selling`
        );
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Product "${name}" removed from inventory.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Order update
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingOrder(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.orderNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: updatingStatus,
          supplierOrderRef: supplierRefInput,
          trackingNumber: trackingNumberInput,
          trackingCarrier: trackingCarrierInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Order ${selectedOrder.orderNumber} fulfillment updated!`);
        setSelectedOrder(null);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingOrder(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCategory(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDesc,
          image: newCatImage || '/images/categories/costume.png',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Category "${newCatName}" added!`);
        setCatModalOpen(false);
        setNewCatName('');
        setNewCatDesc('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (slug: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories?slug=${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Category "${name}" deleted.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Supplier
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupEmail || !newSupPhone) return;
    setSavingSupplier(true);

    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupName,
          contactName: newSupContact || newSupName,
          email: newSupEmail,
          phone: newSupPhone,
          leadTimeDays: Number(newSupLeadTime) || 3,
          notes: newSupNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Supplier partner "${newSupName}" added!`);
        setSupModalOpen(false);
        setNewSupName('');
        setNewSupContact('');
        setNewSupEmail('');
        setNewSupPhone('');
        setNewSupNotes('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSupplier(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Remove supplier "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/suppliers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Supplier "${name}" deleted.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setSavingCoupon(true);

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discountType: newCouponType,
          value: Number(newCouponVal),
          minOrderAmount: Number(newCouponMin) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Offer Coupon "${newCouponCode.toUpperCase()}" created!`);
        setCouponModalOpen(false);
        setNewCouponCode('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCoupon(false);
    }
  };

  // Toggle Coupon status
  const handleToggleCoupon = async (c: ICoupon) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c.code, isActive: !c.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${c.code} is now ${!c.isActive ? 'Active' : 'Paused'}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Products for Inventory
  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (inventoryStockFilter === 'out') return p.stock <= 0;
    if (inventoryStockFilter === 'low') return p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
    if (inventoryStockFilter === 'in_stock') return p.stock > LOW_STOCK_THRESHOLD;
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    return true;
  });

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-8 sm:py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 border border-neutral-700">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Admin Control Center
              </span>
              {totalAlertCount > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {totalAlertCount} alerts pending
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Palette Hubb Operations
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Live inventory tracking, dropship fulfillment, catalog media, supplier routing & pricing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
          </div>
        </div>

        {/* 7 Requested Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-neutral-200">
          {/* 1. Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              totalStockAlerts > 0 ? 'bg-amber-400 text-black' : 'bg-neutral-200 text-neutral-800'
            }`}>
              {products.length}
            </span>
          </button>

          {/* 2. Order */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {orders.length}
            </span>
          </button>

          {/* 3. Category */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Category</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {categories.length}
            </span>
          </button>

          {/* 4. Supplier */}
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Supplier</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {suppliers.length}
            </span>
          </button>

          {/* 5. Best Selling */}
          <button
            onClick={() => setActiveTab('bestselling')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'bestselling'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Best Selling</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {products.filter((p) => p.isFeatured).length}
            </span>
          </button>

          {/* 6. Offer */}
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Offer</span>
            <span className="bg-neutral-200 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {coupons.length}
            </span>
          </button>

          {/* 7. Alert (Low Stock Warnings) */}
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-red-600 text-white shadow-sm'
                : totalAlertCount > 0
                ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Alert</span>
            {totalAlertCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {totalAlertCount}
              </span>
            )}
          </button>

          {/* 8. Overview */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY (With Low Warning Badges & Filters) */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Low Stock Warning Banner if any */}
            {totalStockAlerts > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-200/60 flex items-center justify-center flex-shrink-0 text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Low Inventory Warning System Active ({totalStockAlerts} items require attention)
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      {outOfStockProducts.length} product(s) completely out of stock, and {lowStockProducts.length} product(s) below threshold of {LOW_STOCK_THRESHOLD} units.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="bg-amber-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  View Alert Center →
                </button>
              </div>
            )}

            {/* Inventory Controls Bar */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inventory by title, category, or slug..."
                  className="w-full bg-neutral-50 rounded-xl py-2 pl-9 pr-4 text-xs border border-neutral-200 focus:outline-none focus:border-black"
                />
              </div>

              {/* Stock Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setInventoryStockFilter('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    inventoryStockFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setInventoryStockFilter('in_stock')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    inventoryStockFilter === 'in_stock'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  In Stock ({products.filter((p) => p.stock > LOW_STOCK_THRESHOLD).length})
                </button>
                <button
                  onClick={() => setInventoryStockFilter('low')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    inventoryStockFilter === 'low'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Low Stock ({lowStockProducts.length})</span>
                </button>
                <button
                  onClick={() => setInventoryStockFilter('out')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    inventoryStockFilter === 'out'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <span>Out of Stock ({outOfStockProducts.length})</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 uppercase font-semibold">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock Level & Warning</th>
                      <th className="pb-3">Quick Restock</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => {
                      const isOutOfStock = p.stock <= 0;
                      const isLowStock = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;

                      return (
                        <tr
                          key={p._id}
                          className={`hover:bg-neutral-50/80 transition-colors ${
                            isOutOfStock
                              ? 'bg-red-50/30'
                              : isLowStock
                              ? 'bg-amber-50/30'
                              : ''
                          }`}
                        >
                          <td className="py-3.5 flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200/60">
                              <Image
                                src={p.images[0] || '/images/products/oversized-tshirt.png'}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 leading-snug">{p.name}</p>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.slug}</p>
                            </div>
                          </td>

                          <td className="py-3.5">
                            <span className="bg-neutral-100 text-neutral-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3.5">
                            <p className="font-bold text-black text-sm">₹ {p.price.toLocaleString('en-IN')}</p>
                            {p.originalPrice && (
                              <p className="text-[10px] text-neutral-400 line-through">
                                ₹ {p.originalPrice.toLocaleString('en-IN')}
                              </p>
                            )}
                          </td>

                          {/* LOW WARNING SYSTEM STATUS BADGE */}
                          <td className="py-3.5">
                            {isOutOfStock ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 font-bold text-[10px] animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-600" />
                                <span>CRITICAL: Out of Stock (0)</span>
                              </div>
                            ) : isLowStock ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px]">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>LOW STOCK WARNING: {p.stock} left</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>In Stock: {p.stock} units</span>
                              </div>
                            )}
                          </td>

                          {/* Quick Restock Buttons */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickRestock(p, 5)}
                                title="Add 5 units"
                                className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 font-semibold text-[11px] text-neutral-800 cursor-pointer"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickRestock(p, 20)}
                                title="Add 20 units"
                                className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 font-semibold text-[11px] text-neutral-800 cursor-pointer"
                              >
                                +20
                              </button>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-100 cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                className="p-1.5 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-100"
                                title="View on storefront"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(p.slug, p.name)}
                                className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Orders Header & Filter */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders by order #, customer, email..."
                  className="w-full bg-neutral-50 rounded-xl py-2 pl-9 pr-4 text-xs border border-neutral-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="Paid">Paid / Pending Routing</option>
                  <option value="Ordered from Supplier">Ordered from Supplier</option>
                  <option value="Shipped">Shipped / In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 uppercase font-semibold">
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Customer Details</th>
                      <th className="pb-3">Items Ordered</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Supplier Reference</th>
                      <th className="pb-3">Carrier / Tracking</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-neutral-50">
                        <td className="py-4 font-bold text-black font-mono">{ord.orderNumber}</td>
                        <td className="py-4">
                          <p className="font-bold text-neutral-900">{ord.customer.fullName}</p>
                          <p className="text-[11px] text-neutral-500">{ord.customer.email}</p>
                          <p className="text-[11px] text-neutral-400">{ord.customer.city}, {ord.customer.pincode}</p>
                        </td>
                        <td className="py-4">
                          {ord.items.map((i) => (
                            <p key={i.productId} className="text-neutral-700">
                              {i.quantity}x {i.name} {i.size ? `(${i.size})` : ''}
                            </p>
                          ))}
                        </td>
                        <td className="py-4 font-bold text-black text-sm">
                          ₹ {ord.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4">
                          {ord.supplierOrderRef ? (
                            <span className="font-mono text-neutral-800 font-semibold bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                              {ord.supplierOrderRef}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                              Routing Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          {ord.trackingNumber ? (
                            <div>
                              <p className="font-semibold text-neutral-900">{ord.trackingCarrier}</p>
                              <p className="font-mono text-[11px] text-neutral-500">{ord.trackingNumber}</p>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Not dispatched</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span
                            className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.orderStatus === 'Ordered from Supplier'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setUpdatingStatus(ord.orderStatus);
                              setSupplierRefInput(ord.supplierOrderRef || '');
                              setTrackingNumberInput(ord.trackingNumber || '');
                              setTrackingCarrierInput(ord.trackingCarrier || 'Bluedart Express');
                            }}
                            className="bg-black text-white px-3.5 py-1.5 rounded-xl font-semibold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                          >
                            Fulfill / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORY (catogery) */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Product Categories</h3>
                <p className="text-xs text-neutral-500">
                  Organize store drops into distinct apparel, footwear, and accessory collections.
                </p>
              </div>
              <button
                onClick={() => setCatModalOpen(true)}
                className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <div
                    key={cat.slug}
                    className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 rounded-2xl overflow-hidden bg-neutral-100 mb-4 border border-neutral-100">
                        <Image
                          src={cat.image || '/images/categories/costume.png'}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {count} Products
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-neutral-900">{cat.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {cat.description || 'Curated fashion and dropshipping catalog items.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        target="_blank"
                        className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center gap-1"
                      >
                        <span>Browse in Shop</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SUPPLIER PARTNERS */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Dropshipping Suppliers Directory</h3>
                <p className="text-xs text-neutral-500">
                  Direct manufacturing and fulfillment partners responsible for printing, packaging, and dispatch.
                </p>
              </div>
              <button
                onClick={() => setSupModalOpen(true)}
                className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supplier</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {suppliers.map((sup) => (
                <div
                  key={sup._id}
                  className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-neutral-900">{sup.name}</h4>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Active Partner
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {sup.notes || 'Full dropshipping partner for verified garment fulfillment.'}
                    </p>

                    <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-semibold text-neutral-800">{sup.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <a href={`mailto:${sup.email}`} className="hover:underline">{sup.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{sup.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Dispatch Lead Time: <strong>{sup.leadTimeDays} business days</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-mono">ID: {sup._id}</span>
                    <button
                      onClick={() => handleDeleteSupplier(sup._id, sup.name)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BEST SELLING */}
        {activeTab === 'bestselling' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-6 rounded-3xl border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  Best Selling & Homepage Top Picks Management
                </h3>
              </div>
              <p className="text-xs text-neutral-600">
                Products marked as &quot;Best Selling&quot; (Featured) are automatically highlighted on the homepage banner, catalog top picks carousel, and promotional drops.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 uppercase font-semibold">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock Status</th>
                      <th className="pb-3">Rating</th>
                      <th className="pb-3 text-center">Best Selling Toggle</th>
                      <th className="pb-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-neutral-50">
                        <td className="py-3.5 flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                            <Image
                              src={p.images[0] || '/images/products/oversized-tshirt.png'}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">{p.name}</p>
                            <p className="text-[10px] text-neutral-400">{p.slug}</p>
                          </div>
                        </td>

                        <td className="py-3.5 font-medium text-neutral-600">{p.category}</td>
                        <td className="py-3.5 font-bold text-black">₹ {p.price.toLocaleString('en-IN')}</td>
                        
                        <td className="py-3.5">
                          {p.stock <= 0 ? (
                            <span className="text-red-600 font-bold">Out of stock</span>
                          ) : p.stock <= LOW_STOCK_THRESHOLD ? (
                            <span className="text-amber-700 font-bold">Low: {p.stock} left</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">{p.stock} units</span>
                          )}
                        </td>

                        <td className="py-3.5 font-semibold text-neutral-700">
                          ★ {p.rating || 5.0} ({p.reviewsCount || 10})
                        </td>

                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleToggleBestSelling(p)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              p.isFeatured
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            <Flame className={`w-3.5 h-3.5 ${p.isFeatured ? 'fill-current' : ''}`} />
                            <span>{p.isFeatured ? 'Best Seller ★' : 'Set as Best Seller'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 text-right">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="text-neutral-600 hover:text-black font-semibold underline text-xs"
                          >
                            Preview
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OFFER & COUPONS */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Promotional Offers & Coupons</h3>
                <p className="text-xs text-neutral-500">
                  Manage percentage and flat discount coupon codes applied during checkout.
                </p>
              </div>
              <button
                onClick={() => setCouponModalOpen(true)}
                className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Offer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className={`bg-white rounded-3xl p-6 border transition-all ${
                    c.isActive ? 'border-neutral-200 shadow-sm' : 'border-neutral-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-base font-black tracking-wider bg-black text-white px-3 py-1 rounded-xl">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleToggleCoupon(c)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer ${
                        c.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <p className="text-xl font-black text-neutral-900 mt-2">
                    {c.discountType === 'percentage' ? `${c.value}% OFF` : `₹ ${c.value} OFF`}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Minimum order amount: <strong>₹ {c.minOrderAmount || 0}</strong>
                  </p>

                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">Checkout discount</span>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete coupon ${c.code}?`)) return;
                        await fetch(`/api/coupons?code=${c.code}`, { method: 'DELETE' });
                        showToast(`Coupon ${c.code} deleted.`);
                        fetchAdminData();
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ALERT (Low Stock Warning System) */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* System Alert Summary Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    Live Operations Alert & Low Stock Warning Hub
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Automated threshold monitoring for out-of-stock items, low stock warnings, and pending order routing.
                  </p>
                </div>
              </div>

              {/* 3 Metric Warning Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block mb-1">
                    Out of Stock (Urgent)
                  </span>
                  <p className="text-2xl font-black text-red-800">{outOfStockProducts.length}</p>
                  <span className="text-[10px] text-red-600">Immediate supplier reorder required</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                    Low Stock Warnings (&le; {LOW_STOCK_THRESHOLD} left)
                  </span>
                  <p className="text-2xl font-black text-amber-900">{lowStockProducts.length}</p>
                  <span className="text-[10px] text-amber-700">Approaching zero units</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    Pending Supplier Dispatch
                  </span>
                  <p className="text-2xl font-black text-blue-900">{pendingFulfillmentOrders.length}</p>
                  <span className="text-[10px] text-blue-600">Orders awaiting routing AWB</span>
                </div>
              </div>
            </div>

            {/* Critical Stock Warning List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Low Stock Warning Items ({totalStockAlerts})</span>
              </h4>

              {totalStockAlerts === 0 ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-900">All Product Inventory Healthy!</p>
                  <p className="text-xs text-emerald-700">No items are currently below the low stock threshold.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...outOfStockProducts, ...lowStockProducts].map((item) => {
                    const isZero = item.stock <= 0;
                    return (
                      <div
                        key={item._id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                          isZero
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                            <Image
                              src={item.images[0] || '/images/products/oversized-tshirt.png'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-neutral-900">{item.name}</h5>
                            <p className="text-[10px] text-neutral-500">{item.category}</p>
                            <span
                              className={`inline-block mt-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                isZero ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                              }`}
                            >
                              {isZero ? '0 Left (OUT OF STOCK)' : `Only ${item.stock} left in stock`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleQuickRestock(item, 10)}
                            className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            +10 Units
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Orders Alerts */}
            {pendingFulfillmentOrders.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Orders Awaiting Routing ({pendingFulfillmentOrders.length})</span>
                </h4>
                <div className="divide-y divide-neutral-100 text-xs">
                  {pendingFulfillmentOrders.map((ord) => (
                    <div key={ord._id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-neutral-900">{ord.orderNumber} — ₹{ord.total}</p>
                        <p className="text-[11px] text-neutral-500">{ord.customer.fullName} ({ord.customer.city})</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setUpdatingStatus(ord.orderStatus);
                          setSupplierRefInput(ord.supplierOrderRef || '');
                          setTrackingNumberInput(ord.trackingNumber || '');
                          setTrackingCarrierInput(ord.trackingCarrier || 'Bluedart Express');
                        }}
                        className="bg-black text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Assign Supplier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Total Gross Sales
                </span>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900">
                  ₹ {stats?.totalSales?.toLocaleString('en-IN') || '12,840'}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  ↑ Verified ecommerce payments
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Total Orders
                </span>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900">
                  {stats?.totalOrders || orders.length}
                </p>
                <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
                  Lifetime orders placed
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Active Catalog SKUs
                </span>
                <p className="text-2xl sm:text-3xl font-black text-neutral-900">
                  {products.length}
                </p>
                <span className="text-[11px] text-neutral-500 font-medium mt-1 block">
                  Across {categories.length} categories
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Low Stock Warnings
                </span>
                <p className={`text-2xl sm:text-3xl font-black ${totalStockAlerts > 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
                  {totalStockAlerts}
                </p>
                <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                  Items needing restock
                </span>
              </div>
            </div>

            {/* Quick Overview Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-neutral-900">Recent Customer Orders</h4>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-neutral-600 hover:text-black">
                    View All →
                  </button>
                </div>
                <div className="divide-y divide-neutral-100 text-xs">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">{o.orderNumber}</p>
                        <p className="text-[11px] text-neutral-500">{o.customer.fullName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">₹ {o.total.toLocaleString('en-IN')}</p>
                        <span className="text-[10px] font-semibold text-neutral-500">{o.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Selling Highlights */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-neutral-900">Featured & Best Selling</h4>
                  <button onClick={() => setActiveTab('bestselling')} className="text-xs font-bold text-neutral-600 hover:text-black">
                    Manage →
                  </button>
                </div>
                <div className="divide-y divide-neutral-100 text-xs">
                  {products.filter((p) => p.isFeatured).slice(0, 5).map((p) => (
                    <div key={p._id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <Image src={p.images[0] || '/images/products/oversized-tshirt.png'} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{p.name}</p>
                          <p className="text-[10px] text-neutral-500">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right font-bold text-black">
                        ₹ {p.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ADD / EDIT PRODUCT MODAL (Supports URL & Device Upload) */}
        {/* ---------------------------------------------------- */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setProductModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 my-8 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-neutral-900" />
                  <h3 className="font-black text-lg text-neutral-900">
                    {editingProductSlug ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
                  </h3>
                </div>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="text-neutral-400 hover:text-black font-bold text-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold uppercase mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Heavyweight Minimalist Oversized Tee"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
                  />
                </div>

                {/* Category & Supplier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Category *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Fulfillment Supplier *</label>
                    <select
                      value={prodSupplierId}
                      onChange={(e) => setProdSupplierId(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black cursor-pointer"
                    >
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.leadTimeDays}d lead)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price, Original Price, Initial Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={prodOrigPrice}
                      onChange={(e) => setProdOrigPrice(e.target.value)}
                      placeholder="For discount badge"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">
                      Stock Count *
                      {Number(prodStock) <= LOW_STOCK_THRESHOLD && (
                        <span className="text-amber-600 font-bold ml-1">(⚠️ Low Warning)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Sizes Variant */}
                <div>
                  <label className="block font-bold uppercase mb-1">Available Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* PRODUCT PHOTO: URL VS PHOTO UPLOAD FROM DEVICE */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase text-[11px] text-neutral-800">
                      Product Photos & Gallery *
                    </label>
                    {/* Mode Toggle: Upload from Device vs URL */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          imageInputMode === 'upload'
                            ? 'bg-black text-white'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload from Device</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          imageInputMode === 'url'
                            ? 'bg-black text-white'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>By Image URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: File Upload from Device */}
                  {imageInputMode === 'upload' && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleDeviceImageUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-6 text-center cursor-pointer transition-all bg-white hover:bg-neutral-50"
                      >
                        <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                        <p className="font-bold text-neutral-800 text-xs">
                          Click to browse and upload photo from your device
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Supports PNG, JPG, WEBP photos from your phone or PC
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: By Image URL */}
                  {imageInputMode === 'url' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/... or /images/products/..."
                        className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-black text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-neutral-800 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  )}

                  {/* Preview Selected Product Images */}
                  {productImages.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-neutral-500 mb-1.5">
                        Selected Photos ({productImages.length}):
                      </p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {productImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-300 bg-white group"
                          >
                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-white text-center py-0.5">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeProductImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold uppercase mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Premium drop-shoulder cut, combed cotton fabric, care instructions..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Best Selling / Featured Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featCheck"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-black cursor-pointer"
                  />
                  <label htmlFor="featCheck" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Feature on Homepage as &quot;Best Selling Top Pick&quot;
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 text-neutral-600 hover:text-black font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    {savingProduct
                      ? 'Saving...'
                      : editingProductSlug
                      ? 'Update Product'
                      : 'Publish to Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ORDER UPDATE MODAL */}
        {/* ---------------------------------------------------- */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="font-bold text-base text-neutral-900">
                  Fulfill Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-black font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Fulfillment Status</label>
                  <select
                    value={updatingStatus}
                    onChange={(e) => setUpdatingStatus(e.target.value as OrderStatus)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-semibold cursor-pointer"
                  >
                    <option value="Paid">Paid (Pending Routing)</option>
                    <option value="Ordered from Supplier">Ordered from Supplier</option>
                    <option value="Shipped">Shipped / In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">
                    Supplier Order Reference ID
                  </label>
                  <input
                    type="text"
                    value={supplierRefInput}
                    onChange={(e) => setSupplierRefInput(e.target.value)}
                    placeholder="e.g. SUP-APX-88231"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-mono uppercase focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Courier Carrier</label>
                    <input
                      type="text"
                      value={trackingCarrierInput}
                      onChange={(e) => setTrackingCarrierInput(e.target.value)}
                      placeholder="Bluedart / Delhivery"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">AWB Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      placeholder="e.g. BD-992182"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-mono focus:border-black"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 text-neutral-600 hover:text-black font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingOrder}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    {savingOrder ? 'Saving...' : 'Save & Update Tracking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ADD CATEGORY MODAL */}
        {/* ---------------------------------------------------- */}
        {catModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCatModalOpen(false)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-base text-neutral-900">Add New Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Streetwear & Hoodies"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Category summary"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Category Image (Upload or URL)</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setCatImageMode('url')}
                      className={`px-3 py-1 text-xs rounded-lg font-bold ${
                        catImageMode === 'url' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatImageMode('upload')}
                      className={`px-3 py-1 text-xs rounded-lg font-bold ${
                        catImageMode === 'upload' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                  {catImageMode === 'url' ? (
                    <input
                      type="text"
                      value={newCatImage}
                      onChange={(e) => setNewCatImage(e.target.value)}
                      placeholder="/images/categories/costume.png or https://..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCatImageUpload}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  )}
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setCatModalOpen(false)} className="px-4 py-2 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingCategory} className="bg-black text-white px-5 py-2 rounded-xl font-bold">
                    {savingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ADD SUPPLIER MODAL */}
        {/* ---------------------------------------------------- */}
        {supModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSupModalOpen(false)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-base text-neutral-900">Add Dropship Supplier Partner</h3>
              <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    placeholder="e.g. Apex Apparel Co."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold uppercase mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={newSupContact}
                      onChange={(e) => setNewSupContact(e.target.value)}
                      placeholder="Manager name"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      value={newSupLeadTime}
                      onChange={(e) => setNewSupLeadTime(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    placeholder="orders@supplier.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Manufacturing Notes</label>
                  <input
                    type="text"
                    value={newSupNotes}
                    onChange={(e) => setNewSupNotes(e.target.value)}
                    placeholder="Specialization, garment qualities..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setSupModalOpen(false)} className="px-4 py-2 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingSupplier} className="bg-black text-white px-5 py-2 rounded-xl font-bold">
                    {savingSupplier ? 'Saving...' : 'Add Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* CREATE COUPON / OFFER MODAL */}
        {/* ---------------------------------------------------- */}
        {couponModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCouponModalOpen(false)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-base text-neutral-900">Create New Offer Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FLASH25"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-mono uppercase font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold uppercase mb-1">Discount Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={newCouponVal}
                      onChange={(e) => setNewCouponVal(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value)}
                    placeholder="499"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setCouponModalOpen(false)} className="px-4 py-2 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingCoupon} className="bg-black text-white px-5 py-2 rounded-xl font-bold">
                    {savingCoupon ? 'Creating...' : 'Activate Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
