import {
  Folder,
  FileText,
  Image,
  Film,
  File,
  FileSpreadsheet,
  Archive,
} from "lucide-react";

const TYPE_CONFIG = {
  folder: { Icon: Folder, color: "#4f8ef7", bg: "rgba(79,142,247,0.15)" },
  pdf: { Icon: FileText, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  image: { Icon: Image, color: "#3ecf8e", bg: "rgba(62,207,142,0.15)" },
  video: { Icon: Film, color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  docx: { Icon: FileText, color: "#4f8ef7", bg: "rgba(79,142,247,0.15)" },
  xlsx: {
    Icon: FileSpreadsheet,
    color: "#3ecf8e",
    bg: "rgba(62,207,142,0.15)",
  },
  zip: { Icon: Archive, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  txt: { Icon: FileText, color: "#8b95a3", bg: "rgba(139,149,163,0.15)" },
  unknown: { Icon: File, color: "#8b95a3", bg: "rgba(139,149,163,0.15)" },
};

export default function FileIcon({ type = "unknown", size = 20 }) {
  const { Icon, color, bg } = TYPE_CONFIG[type] || TYPE_CONFIG.unknown;
  const pad = Math.round(size * 0.45);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + pad * 2,
        height: size + pad * 2,
        borderRadius: 8,
        background: bg,
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={color} strokeWidth={1.8} />
    </span>
  );
}
