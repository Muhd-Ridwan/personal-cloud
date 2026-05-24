import { useRef, useState } from "react";
import { Upload, FolderPlus } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useDrive } from "../../context/DriveContext";
import { getFileTypeFromName } from "../../utils/fileUtils";

export default function UploadButton({ currentFolderId }) {
  const { createFolder, uploadFile } = useDrive();
  const fileInputRef = useRef();
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // uploadFile is now from DriveContext — called at component level
  async function handleFiles(fileList) {
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        await uploadFile(file, (progress) => {
          console.log(`${file.name}: ${progress}%`);
        }, currentFolderId);
      }
    } catch (err) {
      console.error("Upload failed:", err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleCreateFolder() {
    if (!folderName.trim()) return;
    createFolder(folderName.trim(), currentFolderId);
    setFolderName("");
    setShowFolderModal(false);
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative"
      >
        <div className="flex gap-2">
          <Button
            variant="primary"
            icon={<Upload size={14} />}
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </Button>
          <Button
            variant="default"
            icon={<FolderPlus size={14} />}
            onClick={() => setShowFolderModal(true)}
          >
            New Folder
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {dragging && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 pointer-events-none border-2 border-dashed border-[#4f8ef7] bg-[rgba(79,142,247,0.05)]">
            <Upload size={36} className="text-[#4f8ef7]" />
            <span
              className="text-base font-semibold text-[#4f8ef7]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Drop files to upload
            </span>
          </div>
        )}
      </div>

      {showFolderModal && (
        <Modal title="New Folder" onClose={() => setShowFolderModal(false)}>
          <div className="flex flex-col gap-4">
            <input
              autoFocus
              className="w-full bg-[#0d0f12] border border-[#252b36] rounded-xl px-3.5 py-2.5 text-[#e8eaed] text-sm outline-none focus:border-[#4f8ef7] transition-colors placeholder-[#4a5568]"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowFolderModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateFolder}>
                Create
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
