import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Trash2,
  Pin,
  Tag,
  Clock,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import noteService from "../../../services/note.service";
import { formatRelativeTime } from "../../../utils/helpers";

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", id],
    queryFn: () => noteService.getById(id).then((r) => r.data.data.note),
    enabled: !!id,
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    }
  }, [note]);

  const updateMutation = useMutation({
    mutationFn: (data) => noteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["note", id]);
      queryClient.invalidateQueries(["notes"]);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
      toast.error("Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: noteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
      toast.success("Note deleted");
      navigate("/notes");
    },
  });

  const addTag = () => {
    if (tagInput.trim() && note && !note.tags.includes(tagInput.trim().toLowerCase())) {
      const newTags = [...note.tags, tagInput.trim().toLowerCase()];
      updateMutation.mutate({ tags: newTags });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    const newTags = note.tags.filter((t) => t !== tag);
    updateMutation.mutate({ tags: newTags });
  };

  const handleSave = useCallback(() => {
    setIsSaving(true);
    updateMutation.mutate({ title, content });
  }, [title, content, updateMutation]);

  // Autosave on content change with debounce
  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (title !== note.title || content !== (note.content || "")) {
        handleSave();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [title, content, note, handleSave]);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-48 animate-pulse" />
        <div className="card h-96 animate-pulse" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Note not found</p>
        <Link to="/notes" className="text-primary-600 mt-2 inline-block">
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to notes
        </Link>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          <button
            onClick={() => updateMutation.mutate({ isPinned: !note.isPinned })}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? "text-primary-500" : "text-gray-400"}`} />
          </button>
          <button
            onClick={() => handleSave()}
            className="btn-primary"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this note?")) deleteMutation.mutate(id);
            }}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600"
        placeholder="Untitled"
      />

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {note.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
          >
            <Tag className="w-3 h-3" />
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag..."
            className="text-xs bg-transparent border-none focus:outline-none text-gray-500 dark:text-gray-400 w-20"
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last edited {formatRelativeTime(note.updatedAt)}
        </span>
        {note.course && (
          <span className="flex items-center gap-1" style={{ color: note.course.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: note.course.color }} />
            {note.course.code}
          </span>
        )}
      </div>

      {/* Content Editor */}
      <div className="min-h-[400px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300 leading-relaxed resize-none font-mono text-sm"
          placeholder="Start writing... (supports markdown)"
        />
      </div>
    </div>
  );
}
