import { X } from "lucide-react";
import { changelog } from "../../data/changelog";

export default function VersionModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#13161b] border border-[#252b36] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252b36]">
          <div>
            <span
              className="font-bold text-[#e8eaed] text-sm"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Version History
            </span>
            <span className="ml-2 text-[11px] bg-[rgba(79,142,247,0.12)] text-[#4f8ef7] px-2 py-0.5 rounded-full border border-[rgba(79,142,247,0.2)]">
              v{changelog[0].version}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md text-[#8b95a3] hover:bg-[#1f242d] hover:text-[#e8eaed] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Changelog list */}
        <div className="overflow-y-auto max-h-[420px] px-5 py-4 flex flex-col gap-6">
          {changelog.map((entry, i) => (
            <div key={entry.version} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1
                  ${i === 0 ? "bg-[#4f8ef7]" : "bg-[#252b36]"}`}
                />
                {i < changelog.length - 1 && (
                  <div className="w-px flex-1 bg-[#252b36] mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-sm text-[#e8eaed]"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    v{entry.version}
                  </span>
                  <span className="text-[11.5px] text-[#4a5568]">
                    {entry.date}
                  </span>
                  {i === 0 && (
                    <span className="text-[10px] bg-[rgba(62,207,142,0.1)] text-[#3ecf8e] px-1.5 py-0.5 rounded-full border border-[rgba(62,207,142,0.2)]">
                      latest
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-1">
                  {entry.changes.map((change, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-[12.5px] text-[#8b95a3]"
                    >
                      <span className="text-[#4f8ef7] mt-0.5 shrink-0">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
