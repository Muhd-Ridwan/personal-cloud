import { useState, useRef, useEffect } from "react";
import { Search, LayoutGrid, List, LogOut, PanelLeft, X } from "lucide-react";
import { useDrive } from "../../context/DriveContext";
import { useAuth } from "../../context/AuthContext";

export default function TopBar({ onToggleSidebar }) {
  const { viewMode, setViewMode } = useDrive();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearch("");
  }

  return (
    <header className="h-[58px] flex items-center px-4 gap-2 border-b border-[#1d2229] bg-[#13161b] shrink-0">
      <button
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#4a5568] hover:bg-[#1a1e25] hover:text-[#e8eaed] transition-colors cursor-pointer shrink-0"
      >
        <PanelLeft size={16} />
      </button>

      {/* Search — expands inline when open */}
      <div className={`relative flex items-center transition-all duration-200 ${searchOpen ? "flex-1 max-w-md" : "shrink-0"}`}>
        {searchOpen ? (
          <>
            <Search size={14} className="absolute left-3 text-[#4a5568] pointer-events-none" />
            <input
              ref={inputRef}
              className="w-full bg-[#1a1e25] border border-[#4f8ef7] rounded-xl py-2 pl-9 pr-8 text-[13.5px] text-[#e8eaed] placeholder-[#4a5568] outline-none transition-colors"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
            />
            <button
              onClick={closeSearch}
              className="absolute right-2 text-[#4a5568] hover:text-[#e8eaed] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#4a5568] hover:bg-[#1a1e25] hover:text-[#e8eaed] transition-colors cursor-pointer"
          >
            <Search size={16} />
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* View toggle */}
      <div className="flex items-center bg-[#1a1e25] border border-[#252b36] rounded-xl overflow-hidden shrink-0">
        {[
          ["grid", LayoutGrid],
          ["list", List],
        ].map(([mode, Icon]) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            title={`${mode} view`}
            className={`flex items-center justify-center px-2.5 py-1.5 transition-all duration-150 cursor-pointer
              ${viewMode === mode ? "text-[#4f8ef7] bg-[rgba(79,142,247,0.12)]" : "text-[#8b95a3] hover:text-[#e8eaed] hover:bg-[#1f242d]"}`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#4f8ef7] flex items-center justify-center font-bold text-sm text-white">
          {user?.username?.[0]?.toUpperCase() ?? "U"}
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-[#4a5568] hover:bg-[#1a1e25] hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
