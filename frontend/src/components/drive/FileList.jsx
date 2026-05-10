import { useState } from "react";
import { Star, Trash2, Download, Pencil, MoreVertical } from "lucide-react";
import FileIcon from "../ui/FileIcon";
import ContextMenu from "../ui/ContextMenu";
import { useDrive } from "../../context/DriveContext";
import { formatFileSize, formatDate } from "../../utils/fileUtils";
import { r2Service } from "../../services/r2Service";

export default function FileList({ files, onFolderOpen }) {
  const { selectedIds, toggleSelect, toggleStar, moveToTrash } = useDrive();
  const [menu, setMenu] = useState(null);

  function handleContextMenu(e, file) {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, file });
  }

  function getMenuItems(file) {
    return [
      {
        icon: <Download size={14} />,
        label: "Download",
        onClick: () => r2Service.downloadFile(file.key, file.name),
        disabled: file.type === "folder",
      },
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
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Name", "Size", "Modified", ""].map((h, i) => (
              <th
                key={i}
                className="text-left text-[11px] font-semibold uppercase tracking-widest text-[#4a5568] pb-2.5 px-3 border-b border-[#1d2229]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const selected = selectedIds.includes(file.id);
            return (
              <tr
                key={file.id}
                onDoubleClick={() =>
                  file.type === "folder" && onFolderOpen?.(file)
                }
                onClick={(e) =>
                  (e.ctrlKey || e.metaKey) && toggleSelect(file.id)
                }
                onContextMenu={(e) => handleContextMenu(e, file)}
                className={`group cursor-pointer transition-colors border-b border-[#1d2229] last:border-b-0
                  ${selected ? "bg-[rgba(79,142,247,0.08)]" : "hover:bg-[#1a1e25]"}`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <FileIcon type={file.type} size={16} />
                    <span className="text-[13.5px] font-medium text-[#e8eaed]">
                      {file.name}
                    </span>
                    {file.starred && (
                      <Star
                        size={12}
                        className="text-amber-400 fill-amber-400 shrink-0"
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[12.5px] text-[#8b95a3] whitespace-nowrap">
                  {file.type === "folder" ? "—" : formatFileSize(file.size)}
                </td>
                <td className="px-3 py-2.5 text-[12.5px] text-[#8b95a3] whitespace-nowrap">
                  {formatDate(file.updatedAt)}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, file);
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-[#4a5568] opacity-0 group-hover:opacity-100 hover:bg-[#252b36] hover:text-[#e8eaed] transition-all cursor-pointer"
                  >
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
