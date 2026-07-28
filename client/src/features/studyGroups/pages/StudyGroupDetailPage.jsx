import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Users,
  Copy,
  Trash2,
  LogOut,
  Link as LinkIcon,
  Megaphone,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import studyGroupService from "../../../services/studyGroup.service";

export default function StudyGroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const { data: group, isLoading } = useQuery({
    queryKey: ["study-group", id],
    queryFn: () => studyGroupService.getById(id).then((r) => r.data.data.group),
  });

  const leaveMutation = useMutation({
    mutationFn: () => studyGroupService.leave(id),
    onSuccess: () => {
      toast.success("Left group");
      navigate("/study-groups");
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    toast.success("Invite code copied");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!group) return null;

  const currentUserId = localStorage.getItem("userId");
  const isAdmin = group.members.find((m) => m.user._id === currentUserId)?.role === "admin";

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate("/study-groups")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </button>

      <div className="card">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
            style={{ backgroundColor: group.color }}
          >
            {group.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
            {group.course && (
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                {group.course.code || group.course.title}
              </p>
            )}
            {group.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-2">{group.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
          <button onClick={copyInviteCode} className="btn-secondary text-sm">
            <Copy className="w-4 h-4" /> Invite: {group.inviteCode}
          </button>
          {group.meetingLink && (
            <a href={group.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
              <LinkIcon className="w-4 h-4" /> Meeting Link
            </a>
          )}
          {isAdmin && (
            <button onClick={() => setShowAnnouncement(true)} className="btn-secondary text-sm">
              <Megaphone className="w-4 h-4" /> Announce
            </button>
          )}
          <button onClick={() => leaveMutation.mutate()} className="text-sm text-red-500 hover:text-red-700 ml-auto">
            <LogOut className="w-4 h-4 inline mr-1" /> Leave
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-lg w-fit">
        {["members", "announcements"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors
              ${activeTab === tab
                ? "bg-white dark:bg-dark-card shadow-sm text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <div className="space-y-2">
          {group.members.map((m) => (
            <div key={m.user._id} className="card flex items-center gap-3 p-3">
              {m.user.avatar ? (
                <img src={m.user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {m.user.firstName} {m.user.lastName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{m.user.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                m.role === "admin"
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400"
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="space-y-3">
          {group.announcements.length === 0 ? (
            <div className="card text-center py-8">
              <Megaphone className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No announcements yet</p>
            </div>
          ) : (
            group.announcements.map((a, i) => (
              <div key={i} className="card">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{a.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  by {a.createdBy?.firstName} {a.createdBy?.lastName} - {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {showAnnouncement && (
        <AnnouncementModal groupId={id} onClose={() => setShowAnnouncement(false)} />
      )}
    </div>
  );
}

function AnnouncementModal({ groupId, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", content: "" });

  const mutation = useMutation({
    mutationFn: (data) => studyGroupService.addAnnouncement(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["study-group", groupId]);
      toast.success("Announcement posted");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">New Announcement</h2>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" className="input" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
            <textarea className="input min-h-[80px]" value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
