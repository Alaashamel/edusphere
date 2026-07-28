import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Loader2,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import calendarService from "../../../services/calendar.service";
import { formatDate } from "../../../utils/helpers";

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const typeConfig = {
  class: { color: "#3b82f6", label: "Class" },
  exam: { color: "#ef4444", label: "Exam" },
  deadline: { color: "#f59e0b", label: "Deadline" },
  reminder: { color: "#8b5cf6", label: "Reminder" },
  study: { color: "#10b981", label: "Study" },
  custom: { color: "#6b7280", label: "Custom" },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startDate = useMemo(() => {
    const d = new Date(year, month, 1);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [year, month]);

  const endDate = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    d.setDate(d.getDate() + (6 - d.getDay()));
    d.setHours(23, 59, 59, 999);
    return d;
  }, [year, month]);

  const { data: events } = useQuery({
    queryKey: ["calendar", startDate.toISOString(), endDate.toISOString()],
    queryFn: () =>
      calendarService
        .getAll({ start: startDate.toISOString(), end: endDate.toISOString() })
        .then((r) => r.data.data.events),
  });

  const deleteMutation = useMutation({
    mutationFn: calendarService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["calendar"]);
      toast.success("Event deleted");
    },
  });

  const daysInMonth = useMemo(() => {
    const days = [];
    const d = new Date(startDate);
    while (d <= endDate) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date) => {
    if (!events) return [];
    return events.filter((e) => {
      const eventStart = new Date(e.start);
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate()
      );
    });
  };

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const selectedDayEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {MONTHS[month]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={today} className="btn-secondary text-sm">Today</button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 card p-0 overflow-hidden">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-dark-border">
            {DAYS.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {daysInMonth.map((day, i) => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === month;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-gray-100 dark:border-dark-border cursor-pointer transition-colors
                    ${!isCurrentMonth ? "bg-gray-50/50 dark:bg-dark-bg/50" : ""}
                    ${isSelected ? "bg-primary-50 dark:bg-primary-900/10" : "hover:bg-gray-50 dark:hover:bg-dark-surface"}
                  `}
                >
                  <div className={`text-right mb-1 ${!isCurrentMonth ? "text-gray-300 dark:text-gray-600" : ""}`}>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full
                        ${isToday ? "bg-primary-600 text-white font-bold" : ""}
                        ${isSelected && !isToday ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium" : ""}
                        ${!isToday && !isSelected ? "text-gray-700 dark:text-gray-300" : ""}
                      `}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        className="text-[10px] sm:text-xs px-1 py-0.5 rounded truncate text-white font-medium"
                        style={{ backgroundColor: event.color || typeConfig[event.type]?.color }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Selected Day */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              {DAY_NAMES[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
            </h3>
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                No events this day
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <div key={event._id} className="p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1 h-full min-h-[40px] rounded-full shrink-0"
                        style={{ backgroundColor: event.color || typeConfig[event.type]?.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {!event.allDay && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.start).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: (event.color || typeConfig[event.type]?.color) + "20",
                            color: event.color || typeConfig[event.type]?.color,
                          }}
                        >
                          {typeConfig[event.type]?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Event Type Legend */}
          <div className="card">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm">Types</h3>
            <div className="space-y-2">
              {Object.entries(typeConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} selectedDate={selectedDate} />}
    </div>
  );
}

function CreateEventModal({ onClose, selectedDate }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: selectedDate.toISOString().slice(0, 16),
    end: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16),
    type: "custom",
    color: "#3b82f6",
    location: "",
    allDay: false,
  });

  const createMutation = useMutation({
    mutationFn: calendarService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["calendar"]);
      toast.success("Event created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Event</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" className="input" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start</label>
              <input type="datetime-local" className="input" value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End</label>
              <input type="datetime-local" className="input" value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select className="input" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
              <input type="color" className="input h-10 p-1 cursor-pointer" value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input type="text" className="input" placeholder="Optional location" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea className="input min-h-[60px]" placeholder="Optional description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
