import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Assignment from "../models/Assignment.model.js";
import Post from "../models/Post.model.js";
import MarketplaceItem from "../models/MarketplaceItem.model.js";

class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalAssignments,
      totalPosts,
      totalMarketplaceItems,
      disabledUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Post.countDocuments(),
      MarketplaceItem.countDocuments(),
      User.countDocuments({ isDisabled: true }),
    ]);

    const roleDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    return {
      totalUsers,
      totalCourses,
      totalAssignments,
      totalPosts,
      totalMarketplaceItems,
      disabledUsers,
      roleDistribution,
    };
  }

  async getUsers(query = {}) {
    const { page = 1, limit = 20, search, role, isDisabled, sort = "-createdAt" } = query;
    const filter = {};
    if (role) filter.role = role;
    if (isDisabled !== undefined) filter.isDisabled = isDisabled === "true";
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = sort.startsWith("-") ? { [sort.slice(1)]: -1 } : { [sort]: 1 };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken -twoFactorSecret")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    user.isDisabled = !user.isDisabled;
    await user.save();
    return user;
  }

  async updateUserRole(userId, role) {
    const user = await User.findById(userId);
    if (!user) return null;
    user.role = role;
    await user.save();
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    return user;
  }

  async getModerationQueue() {
    const [posts, items] = await Promise.all([
      Post.find()
        .populate("author", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      MarketplaceItem.find()
        .populate("seller", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    return { recentPosts: posts, recentItems: items };
  }

  async getActivityLog(days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [newUsers, newCourses, newPosts, registrationsByDay] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: since } }),
      Course.countDocuments({ createdAt: { $gte: since } }),
      Post.countDocuments({ createdAt: { $gte: since } }),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return { since, newUsers, newCourses, newPosts, registrationsByDay };
  }
}

export default new AdminService();
