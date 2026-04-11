import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FolderOpen,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Categorías', href: '/categories', icon: FolderOpen },
  { name: 'Órdenes', href: '/orders', icon: ShoppingCart },
  { name: 'Cupones', href: '/discounts', icon: Tag },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { signOut, user } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
            <span className="text-white font-black text-sm tracking-tight">CH</span>
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">CH+</span>
            <span className="text-gray-400 text-xs ml-1">Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Menú
        </p>
        {navigation.map(item => {
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
                  : 'text-gray-400 hover:bg-gray-700/60 hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`h-4.5 w-4.5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                  size={18}
                />
                {item.name}
              </div>
              {isActive && <ChevronRight size={14} className="text-blue-200" />}
            </Link>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-gray-700/50">
        {user?.email && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-150"
        >
          <LogOut size={18} className="text-gray-500 group-hover:text-red-400 transition-colors" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900 shadow-xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col bg-gray-900 shadow-xl">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/90 backdrop-blur px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-700">
              <span className="text-white font-black text-xs">CH</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Admin Panel</span>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
