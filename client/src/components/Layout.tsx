import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Nota: O fechamento da sidebar ao navegar é tratado pelo onClick
  // nos links do Sidebar, não precisamos de useEffect aqui

  // Prevenir scroll do body quando sidebar estiver aberto (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Handler com useCallback para evitar re-renders
  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-white">
      {/* Premium decorative background elements - hidden on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {/* Primary gradient orb - top right */}
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-primary-200/30 via-primary-100/20 to-transparent rounded-full blur-2xl" />

        {/* Medical gradient orb - bottom left */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-tr from-medical-200/30 via-medical-100/20 to-transparent rounded-full blur-2xl" />

        {/* Accent gradient orb - center - only on large screens */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-radial from-primary-50/20 via-transparent to-transparent rounded-full hidden lg:block" />
      </div>

      {/* Mobile sidebar backdrop with blur */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header onMenuClick={handleOpenSidebar} />
        <main className="flex-1 overflow-y-auto scroll-smooth overscroll-contain">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
}
