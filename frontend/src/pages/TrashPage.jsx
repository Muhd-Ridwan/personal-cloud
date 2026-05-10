import { Trash2, RotateCcw } from "lucide-react";
import { useDrive } from "../context/DriveContext";
import FileIcon from "../components/ui/FileIcon";
import Button from "../components/ui/Button";
import { formatFileSize, formatDate } from "../utils/fileUtils";

export default function TrashPage() {
  const { getTrashedFiles, restoreFromTrash, deleteForever } = useDrive();
  const files = getTrashedFiles();

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="font-bold text-lg text-[#e8eaed] tracking-tight"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Trash
        </h1>
        {files.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={() => files.forEach((f) => deleteForever(f.id))}
          >
            Empty Trash
          </Button>
        )}
      </div>

      {/* Content */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 h-60 text-[#4a5568]">
          <Trash2 size={40} strokeWidth={1.2} />
          <p className="text-sm">Trash is empty</p>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Name", "Size", "Deleted", ""].map((h, i) => (
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
            {files.map((file) => (
              <tr
                key={file.id}
                className="border-b border-[#1d2229] last:border-b-0 hover:bg-[#1a1e25] transition-colors"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <FileIcon type={file.type} size={16} />
                    <span className="text-[13.5px] text-[#e8eaed]">
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[12.5px] text-[#8b95a3]">
                  {file.type === "folder" ? "—" : formatFileSize(file.size)}
                </td>
                <td className="px-3 py-2.5 text-[12.5px] text-[#8b95a3]">
                  {formatDate(file.updatedAt)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<RotateCcw size={13} />}
                      onClick={() => restoreFromTrash(file.id)}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={() => deleteForever(file.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
