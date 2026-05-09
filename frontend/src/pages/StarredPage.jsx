import { useDrive } from "../context/DriveContext";
import FileGrid from "../components/drive/FileGrid";
import FileList from "../components/drive/FileList";

export default function StarredPage() {
  const { viewMode, getStarredFiles } = useDrive();
  const files = getStarredFiles();

  return (
    <div className="flex flex-col gap-5">
      <h1
        className="font-bold text-lg text-[#e8eaed] tracking-tight"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        Starred
      </h1>
      <div>
        {viewMode === "grid" ? (
          <FileGrid files={files} />
        ) : (
          <FileList files={files} />
        )}
      </div>
    </div>
  );
}
