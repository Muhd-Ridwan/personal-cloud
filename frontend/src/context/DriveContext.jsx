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
      const [filesData, foldersData] = await Promise.all([
        r2Service.listFiles(),
        r2Service.listFolders(),
      ]);
      const mappedFiles = filesData.map((f) => ({
        ...f,
        folderId: f.folderId ?? null,
        starred: f.starred ?? false,
        trashed: f.trashed ?? false,
        updatedAt: new Date(f.updatedAt),
      }));
      const mappedFolders = foldersData.map((folder) => ({
        ...folder,
        size: 0,
        starred: false,
        trashed: folder.trashed ?? false,
        folderId: folder.parentFolderId ?? null,
        updatedAt: new Date(folder.createdAt),
      }));
      setFiles([...mappedFiles, ...mappedFolders]);
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
      if (!file || file.type === "folder") return;
      await r2Service.toggleStar(file.key);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f)),
      );
    },
    [files],
  );

  const toggleShare = useCallback(
    async (id) => {
      const file = files.find((f) => f.id === id);
      if (!file || file.type === "folder") return;
      const { public: isPublic } = await r2Service.toggleShare(file.key);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, public: isPublic } : f)),
      );
      return isPublic;
    },
    [files],
  );

  const moveToTrash = useCallback(
    async (id) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      if (file.type === "folder") {
        await r2Service.trashFolder(file.id);
      } else {
        await r2Service.trashFile(file.key);
      }
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
      if (file.type === "folder") {
        await r2Service.restoreFolder(file.id);
      } else {
        await r2Service.restoreFile(file.key);
      }
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, trashed: false } : f)),
      );
    },
    [files],
  );

  const renameFile = useCallback(
    async (id, newName) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      if (file.type === "folder") {
        await r2Service.renameFolder(file.id, newName);
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, name: newName } : f)),
        );
        return;
      }
      const { key, name } = await r2Service.renameFile(file.key, newName);
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, id: key, key, name } : f)),
      );
    },
    [files],
  );

  const deleteForever = useCallback(
    async (id) => {
      try {
        const file = files.find((f) => f.id === id);
        if (!file) return;
        if (file.type === "folder") {
          await r2Service.deleteFolder(file.id);
        } else {
          await r2Service.deleteFile(file.key);
        }
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        console.error("Failed to delete:", err.message);
      }
    },
    [files],
  );

  const uploadFile = useCallback(async (file, onProgress, folderId = null) => {
    try {
      const data = await r2Service.uploadFile(file, onProgress, folderId);
      await fetchFiles();
      return data;
    } catch (err) {
      console.error("Failed to upload file:", err.message);
      throw err;
    }
  }, []);

  const createFolder = useCallback(async (name, parentFolderId = null) => {
    const folder = await r2Service.createFolder(name, parentFolderId);
    setFiles((prev) => [
      ...prev,
      {
        ...folder,
        size: 0,
        starred: false,
        folderId: folder.parentFolderId ?? null,
        updatedAt: new Date(folder.createdAt),
      },
    ]);
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
        renameFile,
        fetchFiles,
        toggleShare,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  return useContext(DriveContext);
}
