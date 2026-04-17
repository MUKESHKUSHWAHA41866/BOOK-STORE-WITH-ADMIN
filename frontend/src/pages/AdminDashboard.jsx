import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FiTrendingUp, FiShoppingBag, FiUsers, FiBook, FiDownload, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api";
import { motion } from "framer-motion";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/v1/admin/analytics?days=${days}`)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [days]);

  const exportToCSV = () => {
    if (!data) return;
    
    // Prepare rows for CSV
    const rows = [
      ["KPI", "Value"],
      ["Total Revenue", data.kpis.totalRevenue],
      ["Total Orders", data.kpis.totalOrders],
      ["Total Users", data.kpis.totalUsers],
      ["Books Listed", data.kpis.totalBooks],
      [],
      ["Top Selling Books", "Orders"],
      ...data.topBooks.map(b => [b.title, b.count]),
      [],
      ["Orders by Status", "Count"],
      ...data.ordersByStatus.map(s => [s._id, s.count])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${days}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully!");
  };

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const { kpis, dailyRevenue, topBooks, ordersByStatus, userGrowth } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[100%] p-0 md:p-4 text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100">Insights</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
             <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full sm:w-auto pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:border-blue-500 shadow-sm transition-all"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <FiDownload size={16} />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Total Revenue"
          value={`₹${Number(kpis.totalRevenue || 0).toLocaleString("en-IN")}`}
          Icon={FiTrendingUp}
          color="text-green-600 dark:text-green-400"
          bg="bg-green-100 dark:bg-green-900/30"
        />
        <KpiCard
          label="Orders"
          value={kpis.totalOrders}
          Icon={FiShoppingBag}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-100 dark:bg-blue-900/30"
        />
        <KpiCard
          label="Total Users"
          value={kpis.totalUsers}
          Icon={FiUsers}
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-100 dark:bg-purple-900/30"
        />
        <KpiCard
          label="Books"
          value={kpis.totalBooks}
          Icon={FiBook}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Area Chart */}
        <ChartCard title="Revenue Growth">
          {dailyRevenue.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffff", border: "1px solid #e4e4e7", borderRadius: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: "#3b82f6", fontWeight: 'bold' }}
                  formatter={(v) => [`₹${v}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Orders by Status Pie */}
        <ChartCard title="Status Distribution">
          {ordersByStatus.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ordersByStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{ backgroundColor: "#ffff", border: "1px solid #e4e4e7", borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Books Bar Chart */}
        <ChartCard title="Best Sellers">
          {topBooks.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topBooks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="title"
                  type="category"
                  width={140}
                  tick={{ fontSize: 10, fill: "#71717a", fontWeight: 'bold' }}
                  tickFormatter={(v) => (v?.length > 20 ? v.slice(0, 20) + "…" : v)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffff", border: "1px solid #e4e4e7", borderRadius: 12 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* User Growth Line Chart */}
        <ChartCard title="User Acquisition">
          {userGrowth.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffff", border: "1px solid #e4e4e7", borderRadius: 12 }}
                />
                <Line
                  type="stepAfter"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </motion.div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, Icon, color, bg }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-zinc-800 rounded-3xl p-6 flex items-center gap-5 shadow-lg border border-zinc-100 dark:border-zinc-700 transition-all duration-300"
  >
    <div className={`${bg} ${color} p-4 rounded-2xl`}>
      <Icon size={26} />
    </div>
    <div>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-1">{label}</p>
      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-lg border border-zinc-100 dark:border-zinc-700 transition-all duration-300">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">{title}</h3>
      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
    </div>
    {children}
  </div>
);

const NoData = () => (
  <div className="h-[260px] flex flex-col items-center justify-center text-zinc-400 text-sm">
    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
       <FiTrendingUp size={20} />
    </div>
    No data recorded for this period
  </div>
);

const DashboardSkeleton = () => (
  <div className="h-[100%] p-0 md:p-4 animate-pulse">
    <div className="flex justify-between items-center mb-10">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
      </div>
      <div className="h-12 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
    </div>
  </div>
);

export default AdminDashboard;
