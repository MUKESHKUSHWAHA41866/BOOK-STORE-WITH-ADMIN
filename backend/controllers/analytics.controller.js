const { getDailyRevenue, getTopBooks, getOrdersByStatus, getUserGrowth } = require("../services/order.service");
const Order = require("../models/order");
const User = require("../models/user");
const Book = require("../models/book");
const { getCache, setCache } = require("../utils/redis");

/**
 * GET /admin/analytics
 * Returns all chart data needed for the admin dashboard in one request.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const cacheKey = `analytics:${days}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ status: "Success", data: cached, fromCache: true });
    }

    const [
      dailyRevenue,
      topBooks,
      ordersByStatus,
      userGrowth,
      totalRevenue,
      totalOrders,
      totalUsers,
      totalBooks,
    ] = await Promise.all([
      getDailyRevenue(days),
      getTopBooks(5),
      getOrdersByStatus(),
      getUserGrowth(days),
      // KPIs
      Order.aggregate([
        { $match: { status: { $ne: "Canceled" } } },
        { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "b" } },
        { $unwind: "$b" },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $multiply: [
                  { $convert: { input: "$b.price", to: "double", onError: 0, onNull: 0 } },
                  { $convert: { input: "$quantity", to: "double", onError: 1, onNull: 1 } }
                ] 
              } 
            } 
          } 
        },
      ]).then((r) => r[0]?.total || 0),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Book.countDocuments(),
    ]);

    const data = {
      kpis: { totalRevenue, totalOrders, totalUsers, totalBooks },
      dailyRevenue,
      topBooks,
      ordersByStatus,
      userGrowth,
    };

    await setCache(cacheKey, data, 300); // 5 min TTL

    return res.json({
      status: "Success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
