import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Heart,
  Star,
  Loader2,
  X,
  Tag,
  BookOpen,
  Smartphone,
  FileText,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import marketplaceService from "../../../services/marketplace.service";
import { formatCurrency, formatDate } from "../../../utils/helpers";

const categoryConfig = {
  book: { icon: BookOpen, label: "Book", color: "#3b82f6" },
  notes: { icon: FileText, label: "Notes", color: "#10b981" },
  device: { icon: Smartphone, label: "Device", color: "#8b5cf6" },
  other: { icon: Package, label: "Other", color: "#6b7280" },
};

const conditionLabels = {
  "new": "New",
  "like-new": "Like New",
  "good": "Good",
  "fair": "Fair",
  "poor": "Poor",
};

export default function MarketplacePage() {
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("new");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["marketplace", categoryFilter, sortBy, search],
    queryFn: () =>
      marketplaceService
        .getItems({ category: categoryFilter || undefined, sort: sortBy, search: search || undefined })
        .then((r) => r.data.data),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Buy, sell, and exchange with fellow students</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> List Item
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" className="input pl-9 text-sm" placeholder="Search items..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input text-sm w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="book">Books</option>
            <option value="notes">Notes</option>
            <option value="device">Devices</option>
            <option value="other">Other</option>
          </select>
          <select className="input text-sm w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="new">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No items found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Be the first to list an item</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.items?.map((item) => (
            <MarketplaceCard key={item._id} item={item} queryClient={queryClient} />
          ))}
        </div>
      )}

      {showCreate && <CreateItemModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function MarketplaceCard({ item, queryClient }) {
  const favMutation = useMutation({
    mutationFn: () => marketplaceService.favorite(item._id),
    onSuccess: () => queryClient.invalidateQueries(["marketplace"]),
  });

  const Icon = categoryConfig[item.category]?.icon || Package;

  return (
    <div className="card overflow-hidden group">
      <div className="relative h-40 bg-gray-100 dark:bg-dark-surface flex items-center justify-center">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        )}
        <button
          onClick={() => favMutation.mutate()}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-dark-card/80 hover:bg-white dark:hover:bg-dark-card"
        >
          <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
        <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium"
          style={{ backgroundColor: categoryConfig[item.category]?.color + "20", color: categoryConfig[item.category]?.color }}>
          {categoryConfig[item.category]?.label}
        </span>
      </div>
      <div className="p-3">
        <Link to={`/marketplace/${item._id}`}>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate hover:text-primary-600 transition-colors">
            {item.title}
          </h3>
        </Link>
        {item.author && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.author}</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(item.originalPrice)}</span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{conditionLabels[item.condition]}</span>
        </div>
        {item.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-gray-500">{item.averageRating?.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateItemModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "book",
    price: "",
    originalPrice: "",
    condition: "good",
    author: "",
    isbn: "",
  });

  const mutation = useMutation({
    mutationFn: (data) => marketplaceService.create({ ...data, price: parseFloat(data.price), originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries(["marketplace"]);
      toast.success("Item listed");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">List Item</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea className="input min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="book">Book</option>
                <option value="notes">Notes</option>
                <option value="device">Device</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Condition</label>
              <select className="input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price ($)</label>
              <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Original Price ($)</label>
              <input type="number" step="0.01" min="0" className="input" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
            </div>
          </div>
          {form.category === "book" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Author</label>
                <input type="text" className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ISBN</label>
                <input type="text" className="input" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} List Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
