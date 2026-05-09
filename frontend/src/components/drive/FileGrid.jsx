import { useState } from "react";
import { Star, MoreVertical, Trash2, Download, Pencil } from "lucide-react";
import FileIcon from "../ui/FileIcon";
import ContextMenu from "../ui/ContextMenu";
import { useDrive } from "../../context/DriveContext";
import { formatFileSize } from "../../utils/fileUtils";

export default function FileGrid({ files, onFolderOpen }) {
  const { selectedIds, toggleSelect, toggleStar, moveToTrash } = useDrive();
  const [menu, setMenu] = useState(null); // { x, y, file }

  function handleContextMenu(e, file) {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, file });
  }

  function getMenuItems(file) {
    return [
      { icon: <Download size={14} />, label: "Download", onClick: () => {} },
      { icon: <Pencil size={14} />, label: "Rename", onClick: () => {} },
      {
        icon: <Star size={14} />,
        label: file.starred ? "Unstar" : "Star",
        onClick: () => toggleStar(file.id),
      },
      { divider: true },
      {
        icon: <Trash2 size={14} />,
        label: "Move to Trash",
        danger: true,
        onClick: () => moveToTrash(file.id),
      },
    ];
  }

  if (!files.length) {
    return (
      <div className="flex items-center justify-center h-48 text-[#4a5568] text-sm">
        No files here yet.
      </div>
    );
  }

  return (
    <>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {files.map((file) => {
          const selected = selectedIds.includes(file.id);
          return (
            <div
              key={file.id}
              onDoubleClick={() =>
                file.type === "folder" && onFolderOpen?.(file)
              }
              onClick={(e) => (e.ctrlKey || e.metaKey) && toggleSelect(file.id)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className={`group relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-150
                ${
                  selected
                    ? "border-[#4f8ef7] bg-[rgba(79,142,247,0.1)]"
                    : "border-[#1d2229] bg-[#13161b] hover:bg-[#1a1e25] hover:border-[#252b36]"
                }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <FileIcon type={file.type} size={22} />
                <div className="flex items-center gap-1">
                  {file.starred && (
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, file);
                    }}
                    className="flex items-center justify-center w-6 h-6 rounded-md text-[#4a5568] opacity-0 group-hover:opacity-100 hover:bg-[#252b36] hover:text-[#e8eaed] transition-all cursor-pointer"
                  >
                    <MoreVertical size={13} />
                  </button>
                </div>
              </div>

              {/* File info */}
              <p className="text-[13px] font-medium text-[#e8eaed] truncate">
                {file.name}
              </p>
              <p className="text-[11.5px] text-[#4a5568] mt-0.5">
                {file.type === "folder" ? "Folder" : formatFileSize(file.size)}
              </p>
            </div>
          );
        })}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={getMenuItems(menu.file)}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}
