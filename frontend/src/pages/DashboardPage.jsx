import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Clock } from 'lucide-react';
import api from '../utils/api.js';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary').then(r => { setSummary(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Cargando...</div>;

  const stats = [
    { label: 'Ventas hoy', value: fmt(summary?.todayRevenue || 0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
    { label: 'Transacciones hoy', value: summary?.todaySalesCount || 0, icon: ShoppingCart, color: 'text-brand-400', bg: 'bg-brand-900/30' },
    { label: 'Productos activos', value: summary?.totalProducts || 0, icon: Package, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    { label: 'Stock bajo', value: summary?.lowStockCount || 0, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-slate-400" />
          <h2 className="font-semibold text-white">Ventas Recientes</h2>
        </div>
        {summary?.recentSales?.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No hay ventas aún</p>
        ) : (
          <div className="space-y-2">
            {summary?.recentSales?.map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-3 border-b border-[#334155] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">Venta #{sale.id}</p>
                  <p className="text-xs text-slate-500">{sale.user?.name} · {fmtDate(sale.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{fmt(sale.total)}</p>
                  <p className="text-xs text-slate-500">{sale.items?.length} items</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
