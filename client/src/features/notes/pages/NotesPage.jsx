import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  StickyNote,
  Folder,
  Tag,
  Pin,
  Archive,
  Trash2,
  FolderPlus,
  Loader2,
  MoreHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import noteService from "../../../services/note.service";
import { formatDate, truncate } from "../../../utils/helpers";

export default function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(searchParams.get("folder") || null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notes", { folderId: selectedFolder, search }],
    queryFn: () =>
      noteService.getAll({ folderId: selectedFolder, search }).then((r) => r.data.data),
  });

  const { data: foldersData } = useQuery({
    queryKey: ["folders"],
    queryFn: () => noteService.getFolders().then((r) => r.data.data.folders),
  });

  const deleteMutation = useMutation({
    mutationFn: noteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
      toast.success("Note deleted");
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, isPinned }) => noteService.update(id, { isPinned }),
    onSuccess: () => queryClient.invalidateQueries(["notes"]),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your personal knowledge base
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders & Tags */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Folders</h3>
              <button
                onClick={() => setShowCreate(true)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"
              >
                <FolderPlus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedFolder
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-surface"
                }`}
              >
                <StickyNote className="w-4 h-4" />
                All Notes
                <span className="ml-auto text-xs opacity-60">{data?.pagination?.total || 0}</span>
              </button>
              {foldersData?.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => setSelectedFolder(folder._id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolder === folder._id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-surface"
                  }`}
                >
                  <Folder className="w-4 h-4" style={{ color: folder.color }} />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="lg:col-span-3">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse h-40" />
              ))}
            </div>
          ) : data?.notes?.length === 0 ? (
            <div className="card text-center py-12">
              <StickyNote className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No notes yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start writing to capture your thoughts
              </p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.notes?.map((note) => (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="card-hover group relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                      {note.isPinned && (
                        <Pin className="w-3 h-3 text-primary-500 inline mr-1" />
                      )}
                      {note.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        pinMutation.mutate({ id: note._id, isPinned: !note.isPinned });
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-dark-surface transition-opacity"
                    >
                      <Pin className={`w-3 h-3 ${note.isPinned ? "text-primary-500" : "text-gray-400"}`} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">
                    {truncate(note.content, 150) || "Empty note"}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {note.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>{formatDate(note.updatedAt)}</span>
                    {note.course && (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: note.course.color }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: note.course.color }}
                        />
                        {note.course.code}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateNoteModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateNoteModal({ onClose }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const createMutation = useMutation({
    mutationFn: noteService.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["notes"]);
      toast.success("Note created");
      window.location.href = `/notes/${res.data.data.note._id}`;
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ title, content: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">New Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              className="input"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
