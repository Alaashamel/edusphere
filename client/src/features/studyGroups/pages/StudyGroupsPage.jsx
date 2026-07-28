import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Users,
  Loader2,
  X,
  Copy,
  ExternalLink,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import studyGroupService from "../../../services/studyGroup.service";

export default function StudyGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["study-groups"],
    queryFn: () => studyGroupService.getAll().then((r) => r.data.data.groups),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study Groups</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Collaborate with classmates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(true)} className="btn-secondary">
            Join Group
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : groups?.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No study groups yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">Create or join a group to start collaborating</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups?.map((group) => (
            <Link
              key={group._id}
              to={`/study-groups/${group._id}`}
              className="card hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: group.color }}
                >
                  {group.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 transition-colors">
                    {group.name}
                  </h3>
                  {group.course && (
                    <p className="text-xs text-primary-600 dark:text-primary-400">
                      {group.course.code || group.course.title}
                    </p>
                  )}
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{group.description}</p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  {group.members.length} / {group.maxMembers}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinGroupModal onClose={() => setShowJoin(false)} />}
    </div>
  );
}

function CreateGroupModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", color: "#3b82f6", maxMembers: 20 });

  const mutation = useMutation({
    mutationFn: studyGroupService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["study-groups"]);
      toast.success("Group created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Study Group</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
            <input type="text" className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea className="input min-h-[60px]" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
              <input type="color" className="input h-10 p-1 cursor-pointer" value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Members</label>
              <input type="number" className="input" min={2} max={50} value={form.maxMembers}
                onChange={(e) => setForm({ ...form, maxMembers: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinGroupModal({ onClose }) {
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState("");

  const mutation = useMutation({
    mutationFn: studyGroupService.join,
    onSuccess: () => {
      queryClient.invalidateQueries(["study-groups"]);
      toast.success("Joined group");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Invalid code"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Join Group</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(inviteCode); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Invite Code</label>
            <input type="text" className="input" placeholder="Enter 12-character code"
              value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required />
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Join Group
          </button>
        </form>
      </div>
    </div>
  );
}
