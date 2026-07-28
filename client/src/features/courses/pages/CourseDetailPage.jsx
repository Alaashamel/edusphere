import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Clock,
  MapPin,
  Trash2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import courseService from "../../../services/course.service";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => courseService.getById(id).then((r) => r.data.data.course),
    enabled: !!id,
  });

  const { data: lecturesData } = useQuery({
    queryKey: ["lectures", id],
    queryFn: () => courseService.getLectures(id).then((r) => r.data.data.lectures),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: courseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Course deleted");
      navigate("/courses");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-48 animate-pulse" />
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Course not found</p>
        <Link to="/courses" className="text-primary-600 mt-2 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "lectures", label: "Lectures" },
    { id: "materials", label: "Materials" },
    { id: "announcements", label: "Announcements" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to courses
        </Link>

        <div className="flex items-start gap-4">
          <div
            className="w-4 h-4 rounded-full mt-2 shrink-0"
            style={{ backgroundColor: courseData.color }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {courseData.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-mono">
              {courseData.code} &middot; {courseData.semester} {courseData.year}
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this course?")) {
                deleteMutation.mutate(id);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border">
        <div className="flex gap-0 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {courseData.description && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Description
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseData.description}
                </p>
              </div>
            )}

            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Upcoming Lectures
              </h2>
              {lecturesData?.length > 0 ? (
                <div className="space-y-3">
                  {lecturesData.slice(0, 5).map((lecture) => (
                    <div
                      key={lecture._id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface"
                    >
                      <div className="text-center shrink-0 w-12">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {DAYS[lecture.dayOfWeek]?.slice(0, 3)}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {lecture.startTime}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {lecture.title}
                        </p>
                        {lecture.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {lecture.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No lectures scheduled yet
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Info
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Instructor</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {courseData.instructor?.firstName} {courseData.instructor?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Students</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {courseData.enrolledUsers?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Lectures</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {lecturesData?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {courseData.instructor && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Instructor
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {courseData.instructor.firstName?.[0]}
                      {courseData.instructor.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {courseData.instructor.firstName} {courseData.instructor.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {courseData.instructor.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "lectures" && (
        <div className="card">
          {lecturesData?.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {lecturesData.map((lecture) => (
                <div key={lecture._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0 w-16">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {DAYS[lecture.dayOfWeek]}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lecture.startTime} - {lecture.endTime}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {lecture.title}
                      </h3>
                      {lecture.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {lecture.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No lectures yet. Add your first lecture to get started.
            </p>
          )}
        </div>
      )}

      {(tab === "materials" || tab === "announcements") && (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Coming soon</p>
        </div>
      )}
    </div>
  );
}
