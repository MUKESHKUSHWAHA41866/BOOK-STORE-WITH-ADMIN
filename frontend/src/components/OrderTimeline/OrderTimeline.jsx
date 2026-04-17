import React from "react";
import {
  FiShoppingBag,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiGift,
  FiXCircle,
} from "react-icons/fi";

const ALL_STEPS = [
  { key: "Order Placed", label: "Order Placed", Icon: FiShoppingBag },
  { key: "Confirmed", label: "Confirmed", Icon: FiCheckCircle },
  { key: "Packed", label: "Packed", Icon: FiPackage },
  { key: "Shipped", label: "Shipped", Icon: FiTruck },
  { key: "Out for Delivery", label: "Out for Delivery", Icon: FiMapPin },
  { key: "Delivered", label: "Delivered", Icon: FiGift },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/**
 * OrderTimeline
 * @param {Array} statusHistory - array of {status, timestamp, note}
 * @param {string} currentStatus - current order status
 */
const OrderTimeline = ({ statusHistory = [], currentStatus }) => {
  const isCanceled = currentStatus === "Canceled";

  // Build a map of status → history entry
  const historyMap = {};
  statusHistory.forEach((h) => {
    if (!historyMap[h.status]) historyMap[h.status] = h;
  });

  const steps = isCanceled
    ? [
        { key: "Order Placed", label: "Order Placed", Icon: FiShoppingBag },
        { key: "Canceled", label: "Canceled", Icon: FiXCircle },
      ]
    : ALL_STEPS;

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="py-4 px-2 md:px-6">
      <div className="flex flex-col gap-0">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || step.key === currentStatus;
          const isActive = step.key === currentStatus;
          const historyEntry = historyMap[step.key];

          return (
            <div key={step.key} className="flex items-start gap-4">
              {/* Line + Icon column */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                    isCanceled && step.key === "Canceled"
                      ? "border-red-500 bg-red-900 text-red-400"
                      : isDone
                      ? isActive
                        ? "border-blue-400 bg-blue-900 text-blue-300 shadow-lg shadow-blue-900/50"
                        : "border-green-500 bg-green-900 text-green-400"
                      : "border-zinc-600 bg-zinc-800 text-zinc-600"
                  }`}
                >
                  <step.Icon size={18} />
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-10 my-0.5 transition-all duration-500 ${
                      isDone && idx < currentIndex ? "bg-green-500" : "bg-zinc-700"
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="pt-1.5 pb-8">
                <p
                  className={`font-semibold text-sm md:text-base ${
                    isCanceled && step.key === "Canceled"
                      ? "text-red-400"
                      : isActive
                      ? "text-blue-300"
                      : isDone
                      ? "text-green-400"
                      : "text-zinc-500"
                  }`}
                >
                  {step.label}
                  {isActive && !isCanceled && (
                    <span className="ml-2 inline-block animate-pulse text-xs bg-blue-800 text-blue-300 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                {historyEntry && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatDate(historyEntry.timestamp)}
                    {historyEntry.note && (
                      <span className="ml-2 text-zinc-400">· {historyEntry.note}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
