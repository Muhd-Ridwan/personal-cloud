import { useState } from "react";
import {
  Star,
  MoreVertical,
  Trash2,
  Download,
  Pencil,
  Link,
  Link2Off,
} from "lucide-react";
import FileIcon from "../ui/FileIcon";
import ContextMenu from "../ui/ContextMenu";
import { useDrive } from "../../context/DriveContext";
import { formatFileSize } from "../../utils/fileUtils";
import { r2Service } from "../../services/r2Service";
import Modal from "../ui/Modal";
const BASE_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

export default function FileGrid({ files, onFolderOpen }) {
  const {
    selectedIds,
    toggleSelect,
    toggleStar,
    moveToTrash,
    renameFile,
    toggleShare,
  } = useDrive();
  const [menu, setMenu] = useState(null); // { x, y, file }
  const [renaming, setRenaming] = useState(null);

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
      {
        icon: <Pencil size={14} />,
        label: "Rename",
        onClick: () => setRenaming({ id: file.id, currentName: file.name }),
        disabled: file.type === "folder",
      },
      {
        icon: <Star size={14} />,
        label: file.starred ? "Unstar" : "Star",
        onClick: () => toggleStar(file.id),
      },
      {
        icon: <Link size={14} />,
        label: "Copy Link",
        onClick: async () => {
          if (file.public) {
            await navigator.clipboard.writeText(
              `${BASE_URL}/public/${encodeURIComponent(file.key)}`,
            );
          } else {
            await toggleShare(file.id);
            await navigator.clipboard.writeText(
              `${BASE_URL}/public/${encodeURIComponent(file.key)}`,
            );
          }
        },
        disabled: file.type === "folder",
      },
      ...(file.public
        ? [
            {
              icon: <Link2Off size={14} />,
              label: "Unshare",
              onClick: () => toggleShare(file.id),
              disabled: file.type === "folder",
            },
          ]
        : []),
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
      {renaming && (
        <RenameModal
          currentName={renaming.currentName}
          onConfirm={async (newName) => {
            await renameFile(renaming.id, newName);
            setRenaming(null);
          }}
          onClose={() => setRenaming(null)}
        />
      )}
    </>
  );
}

function RenameModal({ currentName, onConfirm, onClose }) {
  const [value, setValue] = useState(currentName);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && trimmed !== currentName) onConfirm(trimmed);
    else onClose();
  }

  return (
    <Modal title="Rename" onClose={onClose} width={380}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-[#13161b] border border-[#252b36] rounded-xl px-3.5 py-2.5 text-sm text-[#e8eaed] outline-none focus:border-[#4f8ef7] transition-colors"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-[#8b95a3] hover:bg-[#1f242d] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm bg-[#4f8ef7] text-white hover:bg-[#3d7ef6] transition-colors cursor-pointer"
          >
            Rename
          </button>
        </div>
      </form>
    </Modal>
  );
}
