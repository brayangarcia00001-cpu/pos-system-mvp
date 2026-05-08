import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../utils/api.js';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}k` : n;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function StatsPage() {
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/dashboard/sales-chart?days=${days}`),
      api.get('/dashboard/top-products')
    ]).then(([chart, top]) => {
      setChartData(chart.data.map(d => ({ ...d, date: d.date.slice(5) })));
      setTopProducts(top.data.slice(0, 8));
      setLoading(false);
    });
  }, [days]);

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalSales = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
          <p className="text-slate-500 text-sm">Análisis de ventas</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === d ? 'bg-brand-600 text-white' : 'btn-secondary'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500">Ingresos ({days}d)</p>
          <p className="text-xl font-bold text-white">{fmt(totalRevenue)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500">Transacciones ({days}d)</p>
          <p className="text-xl font-bold text-white">{totalSales}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Cargando estadísticas...</div>
      ) : (
        <>
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Ingresos por día</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="url(#grad)" strokeWidth={2} name="Ingresos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Transacciones por día</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {topProducts.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Productos más vendidos</h2>
              <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const max = topProducts[0]?._sum?.total || 1;
                  const pct = ((p._sum?.total || 0) / max) * 100;
                  return (
                    <div key={p.productId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{i + 1}. {p.productName}</span>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>{p._sum?.quantity} uds.</span>
                          <span className="text-emerald-400 font-medium">{fmt(p._sum?.total || 0)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
