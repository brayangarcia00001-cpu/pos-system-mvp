import React, { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, QrCode, X } from 'lucide-react';
import api from '../utils/api.js';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const EMPTY = { name: '', barcode: '', price: '', cost: '', stock: '', minStock: '5', unit: 'unidad', categoryId: '' };

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const load = () => {
    api.get('/products').then(r => setProducts(r.data));
    api.get('/categories').then(r => setCategories(r.data));
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  const openModal = (product = null) => {
    setEditing(product);
    setForm(product ? { name: product.name, barcode: product.barcode || '', price: product.price, cost: product.cost, stock: product.stock, minStock: product.minStock, unit: product.unit, categoryId: product.categoryId || '' } : EMPTY);
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post('/products', form);
      load();
      closeModal();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const startScanner = async () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrRef.current = new Html5Qrcode('scanner-container');
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (code) => {
            setForm(f => ({ ...f, barcode: code }));
            stopScanner();
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-slate-500 text-sm">{products.length} productos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Buscar por nombre o código..." />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#334155]">
              <tr className="text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoría</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">No hay productos</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#273548] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{p.name}</p>
                    {p.barcode && <p className="text-xs text-slate-500 font-mono">{p.barcode}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="badge-green">{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">{fmt(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= p.minStock ? 'badge-red flex items-center gap-1 w-fit' : 'badge-green w-fit'}>
                      {p.stock <= p.minStock && <AlertTriangle size={10} />}
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openModal(p)} className="text-slate-400 hover:text-white transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#334155]">
              <h2 className="font-semibold text-white">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="label">Código de barras</label>
                <div className="flex gap-2">
                  <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className="input" placeholder="Opcional" />
                  <button type="button" onClick={scanning ? stopScanner : startScanner} className="btn-secondary flex items-center gap-1 whitespace-nowrap">
                    <QrCode size={14} /> {scanning ? 'Detener' : 'Escanear'}
                  </button>
                </div>
                {scanning && <div id="scanner-container" ref={scannerRef} className="mt-2 rounded-lg overflow-hidden" />}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Precio venta *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input" required min="0" step="0.01" />
                </div>
                <div>
                  <label className="label">Costo</label>
                  <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="input" min="0" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Stock actual</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="input" min="0" />
                </div>
                <div>
                  <label className="label">Stock mínimo</label>
                  <input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} className="input" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Unidad</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input">
                    {['unidad', 'kg', 'g', 'l', 'ml', 'caja', 'paquete', 'docena'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Categoría</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input">
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
