import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, Menu, X, Store } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  { to: '/inventario', icon: Package, label: 'Inventario' },
  { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile }) => (
    <aside className={`${mobile ? 'flex' : 'hidden md:flex'} flex-col w-64 bg-[#1e293b] border-r border-[#334155] h-full`}>
      <div className="p-5 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <Store size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">POS Pro</p>
            <p className="text-xs text-slate-500">{user?.name}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-[#273548] hover:text-white'}`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[#334155]">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-slate-500">Rol</p>
          <p className="text-sm text-slate-300 capitalize">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full transition-colors">
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex w-64">
            <Sidebar mobile />
          </div>
          <button className="absolute top-4 right-4 z-50 text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1e293b] border-b border-[#334155]">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Store size={16} className="text-brand-500" />
            <span className="font-bold text-white text-sm">POS Pro</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
