import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Plus,
  Search,
  Loader2,
  X,
  MapPin,
  Clock,
  Users,
  Wifi,
  Tag,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import eventService from "../../../services/event.service";

const EVENT_TYPES = [
  { value: "hackathon", label: "Hackathon", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "workshop", label: "Workshop", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "study_session", label: "Study Session", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { value: "career_fair", label: "Career Fair", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "seminar", label: "Seminar", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" },
  { value: "social", label: "Social", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" },
];

function getTypeConfig(type) {
  return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[6];
}

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [filter, setFilter] = useState({ type: "", search: "" });
  const [view, setView] = useState("list");

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["events", filter],
    queryFn: () => eventService.getEvents({
      type: filter.type || undefined,
      search: filter.search || undefined,
    }).then((r) => r.data),
  });

  const { data: myEvents } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventService.getMyEvents().then((r) => r.data.data),
  });

  const registerMutation = useMutation({
    mutationFn: eventService.register,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      toast.success("Registered for event");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const cancelMutation = useMutation({
    mutationFn: eventService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      toast.success("Registration cancelled");
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            Campus Events
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{eventsData?.total || 0} upcoming events</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search events..." className="input pl-10"
            value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
        </div>
        <select className="input w-auto" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All Types</option>
          {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div className="flex bg-gray-100 dark:bg-dark-surface rounded-lg p-0.5">
          <button onClick={() => setView("list")} className={`px-3 py-1.5 text-sm rounded-md ${view === "list" ? "bg-white dark:bg-dark-card shadow" : "text-gray-500"}`}>List</button>
          <button onClick={() => setView("calendar")} className={`px-3 py-1.5 text-sm rounded-md ${view === "calendar" ? "bg-white dark:bg-dark-card shadow" : "text-gray-500"}`}>Calendar</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : view === "list" ? (
        <div className="space-y-4">
          {eventsData?.events?.map((event) => {
            const typeCfg = getTypeConfig(event.type);
            const isRegistered = event.participants?.some((p) => p.user?._id === event.creator?._id && p.status === "registered");
            return (
              <div key={event._id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetail(event)}>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: event.color + "20" }}>
                    <span className="text-lg font-bold" style={{ color: event.color }}>{new Date(event.startDate).getDate()}</span>
                    <span className="text-[10px] uppercase text-gray-500">{new Date(event.startDate).toLocaleString("default", { month: "short" })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${typeCfg.color}`}>{typeCfg.label}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(event.startDate).toLocaleDateString()} {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>}
                      {event.isOnline && <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> Online</span>}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {event.participantCount}/{event.maxParticipants || "∞"}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (isRegistered) cancelMutation.mutate(event._id);
                      else registerMutation.mutate(event._id);
                    }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isRegistered ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "btn-primary"}`}>
                      {isRegistered ? "Registered ✓" : event.isFull ? "Waitlist" : "Register"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <CalendarView events={eventsData?.events || []} />
      )}

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
      {showDetail && <EventDetailModal event={showDetail} onClose={() => setShowDetail(null)} />}
    </div>
  );
}

function CalendarView({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getEventsForDay = (day) => {
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth();
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-xs rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day} className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface min-h-[60px]">
              <div className="font-medium text-gray-900 dark:text-gray-100">{day}</div>
              {dayEvents.slice(0, 2).map((e) => (
                <div key={e._id} className="text-[10px] px-1 py-0.5 rounded truncate mt-0.5" style={{ backgroundColor: e.color + "20", color: e.color }}>
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 2 && <div className="text-[10px] text-gray-500">+{dayEvents.length - 2} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreateEventModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "workshop",
    startDate: "",
    endDate: "",
    location: "",
    isOnline: false,
    meetingUrl: "",
    maxParticipants: "",
    tags: "",
    color: "#6366f1",
  });

  const mutation = useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      toast.success("Event created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Event</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({
            ...form,
            maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea className="input h-24 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
              <input type="color" className="input h-10 p-1" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
              <input type="datetime-local" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
              <input type="datetime-local" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input type="text" className="input" placeholder="Room 101 or Online" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isOnline" className="rounded" checked={form.isOnline} onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} />
              <label htmlFor="isOnline" className="text-sm text-gray-700 dark:text-gray-300">Online Event</label>
            </div>
            <div>
              <input type="number" className="input" placeholder="Max participants" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma separated)</label>
            <input type="text" className="input" placeholder="javascript, react, beginner" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventDetailModal({ event, onClose }) {
  const typeCfg = getTypeConfig(event.type);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: event.color }} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{event.title}</h2>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-4 ${typeCfg.color}`}>{typeCfg.label}</span>
        {event.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{event.description}</p>}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {event.location && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>}
          {event.isOnline && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Wifi className="w-4 h-4" /><span>Online Event</span></div>}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{event.participantCount} / {event.maxParticipants || "∞"} participants</span>
          </div>
          {event.tags?.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-surface rounded text-xs text-gray-600 dark:text-gray-400">{tag}</span>)}
              </div>
            </div>
          )}
        </div>
        {event.participants?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants</h4>
            <div className="flex flex-wrap gap-2">
              {event.participants.filter((p) => p.status === "registered").map((p) => (
                <span key={p.user?._id} className="px-2 py-1 bg-gray-100 dark:bg-dark-surface rounded text-xs text-gray-600 dark:text-gray-400">{p.user?.name || "User"}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
