import React, { useEffect, useState } from "react";
import api from "../../api";
import { FiActivity } from "react-icons/fi";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/api/v1/admin/audit-logs");
        setLogs(res.data.data);
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes("CREATE")) return "text-green-400 bg-green-400/10";
    if (action.includes("DELETE")) return "text-red-400 bg-red-400/10";
    if (action.includes("UPDATE")) return "text-blue-400 bg-blue-400/10";
    return "text-zinc-400 bg-zinc-800";
  };

  return (
    <div className="bg-zinc-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <FiActivity className="text-indigo-400" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">System Audit Logs</h1>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-zinc-400 text-center py-10">No logs found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-zinc-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-200">{log.adminId?.username || "Unknown"}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    {log.entityType} <span className="text-zinc-500 text-xs">({log.entityId.slice(-6)})</span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-xs truncate max-w-[200px]">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
