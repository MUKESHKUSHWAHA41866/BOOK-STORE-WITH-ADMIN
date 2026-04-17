const Order = require("../models/order");
const User = require("../models/user");

/**
 * Aggregate daily revenue for last N days.
 */
const getDailyRevenue = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return Order.aggregate([
    {
      $match: {
        status: { $ne: "Canceled" },
        createdAt: { $gte: since },
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "book",
        foreignField: "_id",
        as: "bookData",
      },
    },
    { $unwind: "$bookData" },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: {
          $sum: { 
            $multiply: [
              { $convert: { input: "$bookData.price", to: "double", onError: 0, onNull: 0 } }, 
              { $convert: { input: "$quantity", to: "double", onError: 1, onNull: 1 } }
            ] 
          },
        },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/**
 * Top N selling books by order count.
 */
const getTopBooks = async (limit = 5) => {
  return Order.aggregate([
    { $match: { status: { $ne: "Canceled" } } },
    { $group: { _id: "$book", count: { $sum: { $convert: { input: "$quantity", to: "double", onError: 1, onNull: 1 } } } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "book",
      },
    },
    { $unwind: "$book" },
    { $project: { title: "$book.title", count: 1, url: "$book.url" } },
  ]);
};

/**
 * Orders breakdown by status.
 */
const getOrdersByStatus = async () => {
  return Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

/**
 * User registrations per day for last N days.
 */
const getUserGrowth = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

module.exports = { getDailyRevenue, getTopBooks, getOrdersByStatus, getUserGrowth };
