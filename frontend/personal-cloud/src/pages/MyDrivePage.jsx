import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, HardDrive } from "lucide-react";
import { useDrive } from "../context/DriveContext";
import FileGrid from "../components/drive/FileGrid";
import FileList from "../components/drive/FileList";
import UploadButton from "../components/drive/UploadButton";

export default function MyDrivePage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { viewMode, getFilesInFolder, files } = useDrive();
  const currentFolderId = folderId || null;

  // Build breadcrumb trail by walking up the folder tree
  function buildBreadcrumb(id) {
    const crumbs = [];
    let current = id;
    while (current) {
      const folder = files.find((f) => f.id === current);
      if (!folder) break;
      crumbs.unshift(folder);
      current = folder.folderId;
    }
    return crumbs;
  }

  const breadcrumbs = buildBreadcrumb(currentFolderId);
  const currentFiles = getFilesInFolder(currentFolderId);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => navigate("/drive")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium transition-colors
              ${
                !currentFolderId
                  ? "text-[#e8eaed]"
                  : "text-[#8b95a3] hover:bg-[#1a1e25] hover:text-[#e8eaed]"
              }`}
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            <HardDrive size={14} />
            My Drive
          </button>

          {breadcrumbs.map((folder, i) => (
            <span key={folder.id} className="flex items-center">
              <ChevronRight size={13} className="text-[#4a5568]" />
              <button
                onClick={() => navigate(`/drive/${folder.id}`)}
                className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors
                  ${
                    i === breadcrumbs.length - 1
                      ? "text-[#e8eaed]"
                      : "text-[#8b95a3] hover:bg-[#1a1e25] hover:text-[#e8eaed]"
                  }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </div>

        <UploadButton currentFolderId={currentFolderId} />
      </div>

      {/* Files */}
      <div className="flex-1">
        {viewMode === "grid" ? (
          <FileGrid
            files={currentFiles}
            onFolderOpen={(f) => navigate(`/drive/${f.id}`)}
          />
        ) : (
          <FileList
            files={currentFiles}
            onFolderOpen={(f) => navigate(`/drive/${f.id}`)}
          />
        )}
      </div>
    </div>
  );
}
