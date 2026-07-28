import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import assignmentService from "../../../services/assignment.service";
import { formatDate } from "../../../utils/helpers";

const priorityConfig = {
  urgent: { color: "badge-danger", label: "Urgent" },
  high: { color: "badge-danger", label: "High" },
  medium: { color: "badge-warning", label: "Medium" },
  low: { color: "badge-success", label: "Low" },
};

const statusConfig = {
  pending: { color: "text-gray-500", icon: Clock, label: "Pending" },
  in_progress: { color: "text-blue-500", icon: AlertCircle, label: "In Progress" },
  submitted: { color: "text-green-500", icon: CheckCircle, label: "Submitted" },
  graded: { color: "text-purple-500", icon: CheckCircle, label: "Graded" },
  returned: { color: "text-orange-500", icon: AlertCircle, label: "Returned" },
};

export default function AssignmentsPage() {
  const [filter, setFilter] = useState({ status: "", priority: "" });
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", filter],
    queryFn: () => assignmentService.getAll(filter).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: assignmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
      toast.success("Assignment deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your assignments
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="input w-auto"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>
        <select
          className="input w-auto"
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
        >
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Assignment List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-20" />
          ))}
        </div>
      ) : data?.assignments?.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No assignments
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.assignments?.map((assignment) => {
            const StatusIcon = statusConfig[assignment.status]?.icon || Clock;
            return (
              <Link
                key={assignment._id}
                to={`/assignments/${assignment._id}`}
                className="card-hover flex items-center gap-4"
              >
                <StatusIcon
                  className={`w-5 h-5 shrink-0 ${statusConfig[assignment.status]?.color}`}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {assignment.course && (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: assignment.course.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: assignment.course.color }}
                        />
                        {assignment.course.code}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                </div>
                <span className={priorityConfig[assignment.priority]?.color}>
                  {priorityConfig[assignment.priority]?.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && <CreateAssignmentModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateAssignmentModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    priority: "medium",
    maxPoints: 100,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => import("../../../services/course.service").then((m) =>
      m.default.getAll({}).then((r) => r.data.data.courses)
    ),
  });

  const createMutation = useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["assignments"]);
      toast.success("Assignment created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      dueDate: new Date(form.dueDate).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          New Assignment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </label>
            <input
              type="text"
              className="input"
              placeholder="Assignment title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Course
            </label>
            <select
              className="input"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              required
            >
              <option value="">Select course</option>
              {coursesData?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Due Date
              </label>
              <input
                type="datetime-local"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Priority
              </label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Max Points
            </label>
            <input
              type="number"
              className="input"
              value={form.maxPoints}
              onChange={(e) => setForm({ ...form, maxPoints: parseInt(e.target.value) })}
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
