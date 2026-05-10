import { useEffect, useRef } from "react";

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 190);
  const top = Math.min(y, window.innerHeight - 280);

  return (
    <div
      ref={ref}
      style={{ left, top }}
      className="fixed z-50 min-w-[170px] bg-[#1a1e25] border border-[#252b36] rounded-xl p-1 shadow-2xl"
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="h-px bg-[#252b36] my-1" />
        ) : (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left transition-colors duration-100 cursor-pointer ${item.danger ? "text-red-400 hover:bg-red-500/10" : "text-[#e8eaed] hover:bg-[#1f242d]"}`}
          >
            {item.icon && (
              <span className={item.danger ? "text-red-400" : "text-[#8b95a3]"}>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
