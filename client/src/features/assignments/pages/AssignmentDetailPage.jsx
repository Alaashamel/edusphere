import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import assignmentService from "../../../services/assignment.service";
import { formatDate, formatRelativeTime } from "../../../utils/helpers";

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

export default function AssignmentDetailPage() {
  const { id } = useParams();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentService.getById(id).then((r) => r.data.data.assignment),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-48 animate-pulse" />
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Assignment not found</p>
        <Link to="/assignments" className="text-primary-600 mt-2 inline-block">
          Back to assignments
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[assignment.status]?.icon || Clock;
  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0 && !["submitted", "graded"].includes(assignment.status);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <Link
          to="/assignments"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to assignments
        </Link>

        <div className="flex items-start gap-4">
          <StatusIcon
            className={`w-6 h-6 mt-1 shrink-0 ${statusConfig[assignment.status]?.color}`}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {assignment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {assignment.course && (
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: assignment.course.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: assignment.course.color }}
                  />
                  {assignment.course.code} - {assignment.course.title}
                </span>
              )}
              <span className={priorityConfig[assignment.priority]?.color}>
                {priorityConfig[assignment.priority]?.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {assignment.description && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {assignment.description}
              </p>
            </div>
          )}

          {assignment.submission?.submittedAt && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Your Submission
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Submitted {formatRelativeTime(assignment.submission.submittedAt)}
              </p>
              {assignment.submission.content && (
                <p className="text-gray-600 dark:text-gray-400">
                  {assignment.submission.content}
                </p>
              )}
              {assignment.submission.grade && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                  <p className="font-medium text-green-800 dark:text-green-300">
                    Grade: {assignment.submission.grade.points}/{assignment.submission.grade.maxPoints}
                    {assignment.submission.grade.letterGrade &&
                      ` (${assignment.submission.grade.letterGrade})`}
                  </p>
                  {assignment.submission.grade.feedback && (
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {assignment.submission.grade.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className={statusConfig[assignment.status]?.color}>
                  {statusConfig[assignment.status]?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDate(assignment.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Time Left</span>
                <span
                  className={
                    isOverdue
                      ? "text-red-500 font-medium"
                      : "text-gray-900 dark:text-gray-100"
                  }
                >
                  {isOverdue
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : `${daysUntilDue} days`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Max Points</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {assignment.maxPoints}
                </span>
              </div>
              {assignment.estimatedDifficulty && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Difficulty</span>
                  <span className="text-gray-900 dark:text-gray-100 capitalize">
                    {assignment.estimatedDifficulty.replace("_", " ")}
                  </span>
                </div>
              )}
              {assignment.estimatedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Est. Time</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {assignment.estimatedTime} min
                  </span>
                </div>
              )}
            </div>
          </div>

          {assignment.attachments?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Attachments
              </h2>
              <div className="space-y-2">
                {assignment.attachments.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface text-sm text-gray-700 dark:text-gray-300"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
