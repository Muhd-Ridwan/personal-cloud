import { useState } from "react";
import { Search, LayoutGrid, List, LogOut } from "lucide-react";
import { useDrive } from "../../context/DriveContext";
import { useAuth } from "../../context/AuthContext";

export default function TopBar() {
  const { viewMode, setViewMode } = useDrive();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  return (
    <header className="h-[58px] flex items-center px-5 gap-4 border-b border-[#1d2229] bg-[#13161b] shrink-0">
      <div className="flex-1 max-w-xl relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568] pointer-events-none"
        />
        <input
          className="w-full bg-[#1a1e25] border border-[#252b36] rounded-xl py-2 pl-9 pr-3 text-[13.5px] text-[#e8eaed] placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="flex bg-[#1a1e25] border border-[#252b36] rounded-xl overflow-hidden">
          {[
            ["grid", LayoutGrid],
            ["list", List],
          ].map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={`${mode} view`}
              className={`flex items-center justify-center px-2.5 py-1.5 transition-all duration-150 cursor-pointer
                                ${viewMode === mode ? "text-[#4f8ef7] bg-[rgba(79, 142, 247, 0.12)]" : "text-[#4a5568] hover:text-[#e8eaed] hover:bg-[#1f242d]"}`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
