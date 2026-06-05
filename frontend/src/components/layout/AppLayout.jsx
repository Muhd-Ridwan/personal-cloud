import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
