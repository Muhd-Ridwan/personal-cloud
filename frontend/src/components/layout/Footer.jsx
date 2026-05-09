import { useState } from "react";
import VersionModal from "../ui/VersionModal";
import { changelog } from "../../data/changelog";

export default function Footer() {
  const [showVersion, setShowVersion] = useState(false);
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <footer className="h-10 flex items-center justify-between px-6 border-t border-[#1d2229] bg-[#13161b] shrink-0">
        {/* Left — copyright */}
        <span className="text-[11.5px] text-[#4a5568]">
          © {new Date().getFullYear()} Orbit Space. All rights reserved.
        </span>

        {/* Center — Rules & Regulations */}
        <button
          onClick={() => setShowRules(true)}
          className="text-[11.5px] text-[#4a5568] hover:text-[#8b95a3] transition-colors cursor-pointer"
        >
          Rules & Regulations
        </button>

        {/* Right — Built with + Version */}
        <div className="flex items-center gap-3">
          <span className="text-[11.5px] text-[#4a5568]">
            Built with <span className="text-[#4f8ef7]">React</span>
            {" & "}
            <span className="text-[#4f8ef7]">Tailwind</span>
          </span>
          <button
            onClick={() => setShowVersion(true)}
            className="text-[11px] bg-[rgba(79,142,247,0.08)] text-[#4f8ef7] border border-[rgba(79,142,247,0.2)] px-2 py-0.5 rounded-full hover:bg-[rgba(79,142,247,0.15)] transition-colors cursor-pointer"
          >
            v{changelog[0].version}
          </button>
        </div>
      </footer>

      {/* Version Modal */}
      {showVersion && <VersionModal onClose={() => setShowVersion(false)} />}

      {/* Rules & Regulations Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setShowRules(false)
          }
        >
          <div className="bg-[#13161b] border border-[#252b36] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#252b36]">
              <span
                className="font-bold text-[#e8eaed] text-sm"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Rules & Regulations
              </span>
              <button
                onClick={() => setShowRules(false)}
                className="flex items-center justify-center w-7 h-7 rounded-md text-[#8b95a3] hover:bg-[#1f242d] hover:text-[#e8eaed] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto max-h-[420px]">
              {[
                {
                  title: "1. Acceptable Use",
                  content:
                    "This platform is for personal file storage only. Do not upload illegal, harmful, or copyrighted content without permission.",
                },
                {
                  title: "2. Account Security",
                  content:
                    "Keep your credentials secure. Do not share your account with others. You are responsible for all activity under your account.",
                },
                {
                  title: "3. Storage Usage",
                  content:
                    "Use storage responsibly. Excessive or abusive usage may result in account suspension.",
                },
                {
                  title: "4. Privacy",
                  content:
                    "Your files are private and only accessible by you. The admin does not access your files except for technical maintenance.",
                },
                {
                  title: "5. Account Termination",
                  content:
                    "The admin reserves the right to suspend or terminate accounts that violate these rules.",
                },
              ].map((rule) => (
                <div key={rule.title} className="flex flex-col gap-1">
                  <span
                    className="text-sm font-semibold text-[#e8eaed]"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {rule.title}
                  </span>
                  <p className="text-[12.5px] text-[#8b95a3] leading-relaxed">
                    {rule.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
