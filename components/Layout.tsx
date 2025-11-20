import React from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { APP_NAME, CURRENCY_SYMBOL } from '../config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useGlobalState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
        ${isActive 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-200 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-card border-r border-dark-border fixed h-full z-20">
        <div className="p-6 border-b border-dark-border flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{APP_NAME}</h1>
        </div>

        <div className="flex-1 py-6 px-3 overflow-y-auto">
          <div className="mb-6 px-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
            <NavItem to="/dashboard" icon={ImageIcon} label="Image Studio" />
            <NavItem to="/buy-credits" icon={CreditCard} label="Buy Credits" />
          </div>

          {currentUser?.role === 'admin' && (
            <div className="mb-6 px-3">
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">Admin</p>
              <NavItem to="/admin" icon={ShieldCheck} label="Command Center" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-dark-border bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-sm font-bold border border-brand-600">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-brand-300 flex items-center gap-1">
                <CreditCard size={10} />
                {currentUser?.credits} Credits
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-dark-card border-b border-dark-border z-30 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h1 className="text-lg font-bold text-white">{APP_NAME}</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden">
          <div className="bg-dark-card w-64 h-full p-4 flex flex-col">
             <div className="flex justify-between items-center mb-8">
               <span className="font-bold text-xl text-white">Menu</span>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                 <X size={24} />
               </button>
             </div>
             <NavItem to="/dashboard" icon={ImageIcon} label="Image Studio" />
             <NavItem to="/buy-credits" icon={CreditCard} label="Buy Credits" />
             {currentUser?.role === 'admin' && (
                <NavItem to="/admin" icon={ShieldCheck} label="Admin Panel" />
             )}
             <div className="mt-auto pt-4 border-t border-dark-border">
                <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400">
                  <LogOut size={18} /> Logout
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;