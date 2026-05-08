import { NavLink } from "react-router-dom";
import { HardDrive, Clock, Star, Trash2, Cloud } from "lucide-react";

const NAV_ITEMS = [
  { to: "/drive", icon: HardDrive, label: "My Drive" },
  { to: "/recent", icon: Clock, label: "Recent" },
  { to: "/starred", icon: Star, label: "Starred" },
  { to: "/trash", icon: Trash2, label: "Trash" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 h-full bg-[#13161b] border-r border-[#1d2229] flex flex-col px-3 shrink-0">
      <div className="flex items-center gap-2.5 px-2 py-[18px] border-b border-[#1d2229] mb-2.5">
        <Cloud size={20} color="#4f8ef7" />
        <span
          className="font-bold text-base text-[#e8eaed] tracking-tight"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          MyDrive
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${isActive} ? 'bg-[rgba(79, 142, 247, 0.12)] text-[#4f8ef7]' : 'text-[#8b95a3] hover:bg-[#1a1e25] hover:text-[#e8eaed]'}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-[#1d2229]">
        <div className="flex justify-between items-center text-[11.5px] mb-2">
          <span className="text-[#4a5568]">Storage</span>
          <span className="text-[#8b95a3]">1.2 / 10GB</span>
        </div>
        <div className="h-1 bg-[#252b36] rounded-full overflow-hidden">
          <div className="h-full bg-[#4f8ef7] rounded-full w-[12%]" />
        </div>
      </div>
    </aside>
  );
}
