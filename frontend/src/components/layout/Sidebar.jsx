import { NavLink } from "react-router-dom";
import { HardDrive, Clock, Star, Trash2, Cloud, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDrive } from "../../context/DriveContext";
import { formatFileSize } from "../../utils/fileUtils";

const NAV_ITEMS = [
  { to: "/drive", icon: HardDrive, label: "My Drive" },
  { to: "/recent", icon: Clock, label: "Recent" },
  { to: "/starred", icon: Star, label: "Starred" },
  { to: "/trash", icon: Trash2, label: "Trash" },
];

export default function Sidebar({ open }) {
  const { user } = useAuth();
  const { totalStorageUsed } = useDrive();
  return (
    <aside
      className={`
        fixed md:relative z-30 md:z-auto
        h-full bg-[#13161b] border-r border-[#1d2229] flex flex-col shrink-0
        transition-all duration-200 overflow-hidden
        ${open ? "w-48 translate-x-0" : "-translate-x-full md:translate-x-0 w-48 md:w-14"}
      `}
    >
      {/* LOGO */}
      <div
        className={`flex items-center gap-2.5 px-4 py-[18px] border-b border-[#1d2229] mb-2.5 ${!open && "justify-center"}`}
      >
        <Cloud size={20} color="#4f8ef7" className="shrink-0" />
        {open && (
          <span
            className="font-bold text-base text-[#e8eaed] tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Orbit Space
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={!open ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150
                ${!open && "justify-center"}
  ${isActive ? "bg-[rgba(79,142,247,0.12)] text-[#4f8ef7]" : "text-[#8b95a3] hover:bg-[#1a1e25] hover:text-[#e8eaed]"}`
            }
          >
            <Icon size={16} className="shrink-0" />
            {open && label}
          </NavLink>
        ))}

        {/* Admin link - only for admin */}
        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            title={!open ? "Admin" : undefined}
            className={({
              isActive,
            }) => `flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 mt-2 border-t border-[#1d2229] pt-3
                  ${!open && "justify-center"} 
          ${
            isActive
              ? "bg-[rgba(79,142,247,0.12)] text-[#4f8ef7]"
              : "text-[#8b95a3] hover:bg-[#1a1e25] hover:text-[#e8eaed]"
          }`}
          >
            <Shield size={16} className="shrink-0" />
            {open && "Admin"}
          </NavLink>
        )}
      </nav>

      {/* Storage */}
      {open && (
        <div className="px-2 py-4 border-t border-[#1d2229]">
          <div className="flex justify-between items-center text-[11.5px]">
            <span className="text-[#4a5568]">Storage used</span>
            <span className="text-[#8b95a3]">
              {formatFileSize(totalStorageUsed)}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
