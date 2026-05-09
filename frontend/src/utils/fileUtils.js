export function formatFileSize(bytes) {
  if (bytes === 0) return "_";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getFileTypeFromName(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    pdf: "pdf",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    mp4: "video",
    mov: "video",
    avi: "video",
    mkv: "video",
    doc: "docx",
    docx: "docx",
    xls: "xlsx",
    xlsx: "xlsx",
    txt: "txt",
    md: "txt",
  };
  return map[ext] || "unknown";
}

export function getFileTypeLabel(type) {
  const labels = {
    folder: "Folder",
    pdf: "PDF",
    image: "Image",
    video: "Video",
    docx: "Word Doc",
    xlsx: "Spreadsheet",
    zip: "Archive",
    txt: "Text",
    unknown: "File",
  };
  return labels[type] || "File";
}
