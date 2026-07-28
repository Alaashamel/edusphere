import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderOpen,
  Upload,
  Star,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Share2,
  Tag,
  MoreVertical,
  File,
  Image,
  Film,
  FileText,
  Music,
  Archive,
  FolderPlus,
  ChevronRight,
  Loader2,
  X,
  Eye,
  RotateCcw,
  HardDrive,
} from "lucide-react";
import toast from "react-hot-toast";
import fileService from "../../../services/file.service";
import courseService from "../../../services/course.service";

const FILE_ICONS = {
  image: { icon: Image, color: "text-green-500" },
  video: { icon: Film, color: "text-purple-500" },
  audio: { icon: Music, color: "text-yellow-500" },
  pdf: { icon: FileText, color: "text-red-500" },
  document: { icon: FileText, color: "text-blue-500" },
  spreadsheet: { icon: FileText, color: "text-green-600" },
  presentation: { icon: FileText, color: "text-orange-500" },
  other: { icon: File, color: "text-gray-500" },
};

function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function FilesPage() {
  const queryClient = useQueryClient();
  const [currentFolder, setCurrentFolder] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [showShare, setShowShare] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [filter, setFilter] = useState({ starred: false, tags: [] });
  const [contextMenu, setContextMenu] = useState(null);

  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ["files", currentFolder, search, filter],
    queryFn: () =>
      fileService.getFiles({
        folder: currentFolder,
        search: search || undefined,
        starred: filter.starred || undefined,
        tags: filter.tags.length > 0 ? filter.tags.join(",") : undefined,
      }).then((r) => r.data),
  });

  const { data: folders } = useQuery({
    queryKey: ["folders", currentFolder],
    queryFn: () => fileService.getFolders(currentFolder).then((r) => r.data.data),
  });

  const { data: trashFiles } = useQuery({
    queryKey: ["trash"],
    queryFn: () => fileService.getTrash().then((r) => r.data.data),
    enabled: showTrash,
  });

  const { data: storageStats } = useQuery({
    queryKey: ["storage-stats"],
    queryFn: () => fileService.getStorageStats().then((r) => r.data.data),
  });

  const { data: sharedFiles } = useQuery({
    queryKey: ["shared-files"],
    queryFn: () => fileService.getSharedWithMe().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.softDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
      toast.success("File moved to trash");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: fileService.restore,
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
      queryClient.invalidateQueries(["trash"]);
      toast.success("File restored");
    },
  });

  const starMutation = useMutation({
    mutationFn: fileService.toggleStar,
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
    },
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, [currentFolder]);

  const uploadFiles = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) formData.append("folder", currentFolder);
      try {
        await fileService.upload(formData);
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    queryClient.invalidateQueries(["files"]);
    queryClient.invalidateQueries(["storage-stats"]);
  };

  const downloadFile = async (file) => {
    try {
      const data = await fileService.download(file._id);
      const a = document.createElement("a");
      a.href = data.url;
      a.download = data.name;
      a.target = "_blank";
      a.click();
    } catch {
      toast.error("Download failed");
    }
  };

  const storagePercent = storageStats ? Math.min((storageStats.totalSize / storageStats.storageLimit) * 100, 100) : 0;

  return (
    <div className="flex h-full animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-dark-border p-4 hidden md:flex flex-col gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Storage</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${storagePercent}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{formatSize(storageStats?.totalSize || 0)} / {formatSize(storageStats?.storageLimit || 5 * 1024 * 1024 * 1024)}</p>
        </div>

        <button onClick={() => setShowUpload(true)} className="btn-primary w-full justify-center">
          <Upload className="w-4 h-4" /> Upload Files
        </button>

        <nav className="space-y-1">
          <button onClick={() => { setCurrentFolder(null); setShowTrash(false); setFilter({ starred: false, tags: [] }); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${!currentFolder && !showTrash ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface"}`}>
            <FolderOpen className="w-4 h-4" /> All Files
          </button>
          <button onClick={() => { setFilter({ ...filter, starred: !filter.starred }); setShowTrash(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${filter.starred ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface"}`}>
            <Star className="w-4 h-4" /> Starred
          </button>
          <button onClick={() => { setShowTrash(!showTrash); setFilter({ starred: false, tags: [] }); setCurrentFolder(null); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${showTrash ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface"}`}>
            <Trash2 className="w-4 h-4" /> Trash
          </button>
        </nav>

        {folders && folders.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Folders</h4>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button key={folder._id}
                  onClick={() => { setCurrentFolder(folder._id); setShowTrash(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface">
                  <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HardDrive className="w-6 h-6 text-primary-500" />
              {showTrash ? "Trash" : "Files"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filesData?.total || 0} files
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search files..." className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="btn-secondary">
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="min-h-[400px]"
        >
          {filesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
          ) : showTrash ? (
            <div className="space-y-2">
              {trashFiles?.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatSize(file.size)}</div>
                    </div>
                  </div>
                  <button onClick={() => restoreMutation.mutate(file._id)} className="btn-secondary text-sm">
                    <RotateCcw className="w-4 h-4" /> Restore
                  </button>
                </div>
              ))}
            </div>
          ) : filesData?.files?.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No files yet. Drag and drop or click Upload to get started.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filesData?.files?.map((file) => {
                const typeInfo = FILE_ICONS[file.fileType] || FILE_ICONS.other;
                const Icon = typeInfo.icon;
                return (
                  <div key={file._id}
                    className="card group cursor-pointer hover:shadow-md transition-shadow relative"
                    onClick={() => file.fileType === "image" || file.fileType === "video" ? setShowPreview(file) : downloadFile(file)}
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu(contextMenu === file._id ? null : file._id); }}>
                    <div className="relative">
                      {file.thumbnailUrl ? (
                        <img src={file.thumbnailUrl} alt={file.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-gray-50 dark:bg-dark-surface rounded-lg mb-2">
                          <Icon className={`w-8 h-8 ${typeInfo.color}`} />
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); starMutation.mutate(file._id); }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-white/80 dark:bg-dark-card/80 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className={`w-4 h-4 ${file.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
                      </button>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</h4>
                    <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                    {contextMenu === file._id && (
                      <div className="absolute right-2 top-20 z-10 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-200 dark:border-dark-border py-1 min-w-[140px]">
                        <button onClick={(e) => { e.stopPropagation(); downloadFile(file); setContextMenu(null); }} className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
                        <button onClick={(e) => { e.stopPropagation(); setShowShare(file); setContextMenu(null); }} className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(file._id); setContextMenu(null); }} className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-dark-surface text-red-500 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filesData?.files?.map((file) => {
                const typeInfo = FILE_ICONS[file.fileType] || FILE_ICONS.other;
                const Icon = typeInfo.icon;
                return (
                  <div key={file._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface cursor-pointer"
                    onClick={() => file.fileType === "image" || file.fileType === "video" ? setShowPreview(file) : downloadFile(file)}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</div>
                        <div className="text-xs text-gray-500">{formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.isStarred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                      <button onClick={(e) => { e.stopPropagation(); downloadFile(file); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"><Download className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(file._id); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowPreview(null)} />
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button onClick={() => setShowPreview(null)} className="absolute -top-10 right-0 text-white"><X className="w-6 h-6" /></button>
            {showPreview.fileType === "image" ? (
              <img src={showPreview.url} alt={showPreview.name} className="max-w-full max-h-[80vh] rounded-lg mx-auto" />
            ) : showPreview.fileType === "video" ? (
              <video src={showPreview.url} controls className="max-w-full max-h-[80vh] rounded-lg mx-auto" />
            ) : null}
            <div className="text-center mt-2 text-white text-sm">{showPreview.name}</div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && <UploadModal folder={currentFolder} onClose={() => setShowUpload(false)} />}

      {/* Share Modal */}
      {showShare && <ShareModal file={showShare} onClose={() => setShowShare(null)} />}
    </div>
  );
}

function UploadModal({ folder, onClose }) {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) formData.append("folder", folder);
      try {
        await fileService.upload(formData);
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    queryClient.invalidateQueries(["files"]);
    queryClient.invalidateQueries(["storage-stats"]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upload Files</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(Array.from(e.dataTransfer.files)); }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" : "border-gray-300 dark:border-dark-border"}`}>
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here</p>
          <label className="btn-primary cursor-pointer">
            <input type="file" multiple className="hidden" onChange={(e) => handleUpload(Array.from(e.target.files))} />
            Choose Files
          </label>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ file, onClose }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");

  const shareMutation = useMutation({
    mutationFn: ({ userId, permission }) => fileService.share(file._id, userId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
      toast.success("File shared");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to share"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Share "{file.name}"</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Enter a user ID to share"); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">User ID</label>
            <input type="text" className="input" placeholder="Enter user ID" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Permission</label>
            <select className="input" value={permission} onChange={(e) => setPermission(e.target.value)}>
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </div>
          {file.sharedWith?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shared with</h4>
              <div className="space-y-1">
                {file.sharedWith.map((s) => (
                  <div key={s.user?._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{s.user?.name || "User"}</span>
                    <span className="text-xs text-gray-500">{s.permission}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Share</button>
          </div>
        </form>
      </div>
    </div>
  );
}
