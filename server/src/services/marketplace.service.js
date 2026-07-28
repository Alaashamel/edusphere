import MarketplaceItem from "../models/MarketplaceItem.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class MarketplaceService {
  async createItem(data, userId) {
    return MarketplaceItem.create({ ...data, seller: userId });
  }

  async getItems({ category, minPrice, maxPrice, condition, search, sort = "new", page = 1, limit = 20 }) {
    const query = { isAvailable: true };
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const sortOption = sort === "price-low" ? { price: 1 }
      : sort === "price-high" ? { price: -1 }
      : sort === "rating" ? { createdAt: -1 }
      : { createdAt: -1 };

    const total = await MarketplaceItem.countDocuments(query);
    const items = await MarketplaceItem.find(query)
      .populate("seller", "firstName lastName avatar")
      .populate("course", "title code")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return { items, total, page: parseInt(page), pages: Math.ceil(total / limit) };
  }

  async getItemById(itemId) {
    const item = await MarketplaceItem.findByIdAndUpdate(
      itemId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("seller", "firstName lastName avatar email")
      .populate("course", "title code")
      .populate("ratings.user", "firstName lastName avatar");
    if (!item) throw new AppError("Item not found", 404);
    return item;
  }

  async updateItem(itemId, data, userId) {
    const item = await MarketplaceItem.findOne({ _id: itemId, seller: userId });
    if (!item) throw new AppError("Item not found or unauthorized", 404);
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async deleteItem(itemId, userId) {
    const item = await MarketplaceItem.findOneAndDelete({ _id: itemId, seller: userId });
    if (!item) throw new AppError("Item not found or unauthorized", 404);
    return true;
  }

  async toggleFavorite(itemId, userId) {
    const item = await MarketplaceItem.findById(itemId);
    if (!item) throw new AppError("Item not found", 404);

    const isFav = item.favorites.some((id) => id.toString() === userId);
    if (isFav) {
      item.favorites = item.favorites.filter((id) => id.toString() !== userId);
    } else {
      item.favorites.push(userId);
    }
    await item.save();
    return { favorited: !isFav };
  }

  async addRating(itemId, { rating, review }, userId) {
    const item = await MarketplaceItem.findById(itemId);
    if (!item) throw new AppError("Item not found", 404);
    if (item.seller.toString() === userId) throw new AppError("Cannot rate your own item", 400);

    const existing = item.ratings.find((r) => r.user.toString() === userId);
    if (existing) {
      existing.rating = rating;
      existing.review = review;
    } else {
      item.ratings.push({ user: userId, rating, review });
    }

    await item.save();
    return item.ratings;
  }

  async getMyListings(userId, { page = 1, limit = 20 } = {}) {
    const query = { seller: userId };
    const total = await MarketplaceItem.countDocuments(query);
    const items = await MarketplaceItem.find(query)
      .populate("course", "title code")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return { items, total, page: parseInt(page), pages: Math.ceil(total / limit) };
  }

  async getFavorites(userId, { page = 1, limit = 20 } = {}) {
    const query = { favorites: userId };
    const total = await MarketplaceItem.countDocuments(query);
    const items = await MarketplaceItem.find(query)
      .populate("seller", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return { items, total, page: parseInt(page), pages: Math.ceil(total / limit) };
  }
}

export default new MarketplaceService();
