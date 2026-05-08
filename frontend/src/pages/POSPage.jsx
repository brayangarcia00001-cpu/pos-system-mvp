import React, { useEffect, useState, useRef } from 'react';
import { Search, QrCode, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, X, CheckCircle } from 'lucide-react';
import api from '../utils/api.js';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [payment, setPayment] = useState('cash');
  const [discount, setDiscount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data));
  }, []);

  const filtered = search.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search)))
    : products.slice(0, 20);

  const addToCart = (product) => {
    if (product.stock === 0) return alert('Sin stock');
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return alert('Sin stock suficiente'), prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
    });
    setSearch('');
    searchRef.current?.focus();
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(i.stock, i.quantity + delta)) } : i));
  };

  const removeItem = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));
  const clearCart = () => { setCart([]); setDiscount(''); };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmt = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmt);

  const processSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const { data } = await api.post('/sales', {
        items: cart.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
        payment, discount: discountAmt
      });
      setSuccess(data);
      clearCart();
      api.get('/products').then(r => setProducts(r.data));
    } catch (err) { alert(err.response?.data?.error || 'Error al procesar'); }
    setProcessing(false);
  };

  const startScanner = async () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrRef.current = new Html5Qrcode('pos-scanner');
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          async (code) => {
            stopScanner();
            try {
              const { data } = await api.get(`/products/barcode/${code}`);
              addToCart(data);
            } catch { alert('Producto no encontrado: ' + code); }
          }
        );
      } catch (err) { console.error(err); setScanning(false); }
    }, 100);
  };

  const stopScanner = async () => {
    try { await html5QrRef.current?.stop(); } catch {}
    setScanning(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Products panel */}
      <div className="flex-1 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Buscar producto o código..." autoFocus />
          </div>
          <button onClick={scanning ? stopScanner : startScanner} className={`btn-secondary flex items-center gap-2 ${scanning ? 'border-brand-500 text-brand-400' : ''}`}>
            <QrCode size={16} /> <span className="hidden sm:inline">{scanning ? 'Detener' : 'Escanear'}</span>
          </button>
        </div>
        {scanning && <div id="pos-scanner" ref={scannerRef} className="rounded-xl overflow-hidden" />}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[60vh] lg:max-h-[75vh] overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0}
              className="card p-3 text-left hover:border-brand-500 hover:bg-[#273548] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <p className="text-xs text-slate-500 mb-1">{p.category?.name || '—'}</p>
              <p className="text-sm font-medium text-white leading-tight">{p.name}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-brand-400 font-bold text-sm">{fmt(p.price)}</p>
                <span className={`text-xs ${p.stock <= p.minStock ? 'text-yellow-400' : 'text-slate-500'}`}>{p.stock}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <div className="lg:w-80 xl:w-96 flex flex-col card">
        <div className="flex items-center justify-between p-4 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-brand-400" />
            <span className="font-semibold text-white">Carrito</span>
            <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
          </div>
          {cart.length > 0 && <button onClick={clearCart} className="text-slate-500 hover:text-red-400 text-xs">Limpiar</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[40vh] lg:max-h-none">
          {cart.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Agrega productos</p>}
          {cart.map(item => (
            <div key={item.productId} className="bg-[#0f172a] rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white font-medium flex-1 leading-tight">{item.name}</p>
                <button onClick={() => removeItem(item.productId)} className="text-slate-600 hover:text-red-400 mt-0.5"><X size={14} /></button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]"><Minus size={12} /></button>
                  <span className="text-sm font-mono w-6 text-center text-white">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center hover:bg-[#334155]"><Plus size={12} /></button>
                </div>
                <p className="text-emerald-400 font-bold text-sm">{fmt(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#334155] space-y-3">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">Descuento</span>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="input text-sm py-1.5" placeholder="0" min="0" />
          </div>
          <div className="flex justify-between font-bold text-white">
            <span>Total</span><span className="text-xl text-emerald-400">{fmt(total)}</span>
          </div>
          <div className="flex gap-2">
            {[{ v: 'cash', icon: Banknote, label: 'Efectivo' }, { v: 'card', icon: CreditCard, label: 'Tarjeta' }].map(({ v, icon: Icon, label }) => (
              <button key={v} onClick={() => setPayment(v)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${payment === v ? 'bg-brand-600 border-brand-500 text-white' : 'border-[#334155] text-slate-400 hover:bg-[#273548]'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <button onClick={processSale} disabled={cart.length === 0 || processing} className="btn-primary w-full py-3 text-base">
            {processing ? 'Procesando...' : `Cobrar ${fmt(total)}`}
          </button>
        </div>
      </div>

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card p-8 text-center max-w-sm w-full">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">¡Venta Completada!</h2>
            <p className="text-slate-400 mb-1">Venta #{success.id}</p>
            <p className="text-3xl font-bold text-emerald-400 mb-6">{fmt(success.total)}</p>
            <button onClick={() => setSuccess(null)} className="btn-primary w-full">Nueva Venta</button>
          </div>
        </div>
      )}
    </div>
  );
}
