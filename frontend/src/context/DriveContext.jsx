import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { r2Service } from "../services/r2Service";
import { useAuth } from "./AuthContext";

const DriveContext = createContext(null);

export function DriveProvider({ children }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const totalStorageUsed = files
    .filter((f) => !f.trashed && f.type !== "folder")
    .reduce((total, f) => total + (f.size || 0), 0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch files from Worker whenever user changes
  useEffect(() => {
    if (user) {
      fetchFiles();
    } else {
      setFiles([]);
    }
  }, [user]);

  async function fetchFiles() {
    try {
      setLoading(true);
      const data = await r2Service.listFiles();
      const mapped = data.map((f) => ({
        ...f,
        folderId: null,
        starred: f.starred ?? false,
        trashed: f.trashed ?? false,
        updatedAt: new Date(f.updatedAt),
      }));
      setFiles(mapped);
    } catch (err) {
      console.error("Failed to fetch files:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const getFilesInFolder = useCallback(
    (folderId) => {
      return files.filter((f) => f.folderId === folderId && !f.trashed);
    },
    [files],
  );

  const getRecentFiles = useCallback(() => {
    return files
      .filter((f) => !f.trashed && f.type !== "folder")
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 20);
  }, [files]);

  const getStarredFiles = useCallback(() => {
    return files.filter((f) => f.starred && !f.trashed);
  }, [files]);

  const getTrashedFiles = useCallback(() => {
    return files.filter((f) => f.trashed);
  }, [files]);

  const toggleStar = useCallback(
    async (id) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      await r2Service.toggleStar(file.key);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f)),
      );
    },
    [files],
  );

  const moveToTrash = useCallback(
    async (id) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      await r2Service.trashFile(file.key);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, trashed: true } : f)),
      );
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    },
    [files],
  );

  const restoreFromTrash = useCallback(
    async (id) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      await r2Service.restoreFile(file.key);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, trashed: false } : f)),
      );
    },
    [files],
  );

  const deleteForever = useCallback(
    async (id) => {
      try {
        const file = files.find((f) => f.id === id);
        if (file) await r2Service.deleteFile(file.key);
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        console.error("Failed to delete file:", err.message);
      }
    },
    [files],
  );

  const uploadFile = useCallback(async (file, onProgress) => {
    try {
      const data = await r2Service.uploadFile(file, onProgress);
      // Refresh files list after upload
      await fetchFiles();
      return data;
    } catch (err) {
      console.error("Failed to upload file:", err.message);
      throw err;
    }
  }, []);

  const createFolder = useCallback((name, parentFolderId = null) => {
    // Folders are local only for now — R2 doesn't have real folders
    const newFolder = {
      id: Date.now().toString(),
      name,
      type: "folder",
      size: 0,
      folderId: parentFolderId,
      starred: false,
      trashed: false,
      updatedAt: new Date(),
    };
    setFiles((prev) => [...prev, newFolder]);
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return (
    <DriveContext.Provider
      value={{
        files,
        totalStorageUsed,
        loading,
        viewMode,
        setViewMode,
        selectedIds,
        toggleSelect,
        clearSelection,
        getFilesInFolder,
        getRecentFiles,
        getStarredFiles,
        getTrashedFiles,
        toggleStar,
        moveToTrash,
        restoreFromTrash,
        deleteForever,
        uploadFile,
        createFolder,
        fetchFiles,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  return useContext(DriveContext);
}
