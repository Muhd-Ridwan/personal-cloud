import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ title, children, onClose, width = 420 }) {
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ width }}
        className="bg-[#1a1e25] border border-[#252b36] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252b36]">
          <span
            className="font-semibold text-[#e8eaed] text-sm tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md text-[#8b95a3] hover:bg-[#1f242d] hover:text-[#e8eaed] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
