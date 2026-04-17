import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

/**
 * StarRating — interactive star rating component.
 * @param {number} value - current rating (1-5)
 * @param {function} onChange - called with new rating
 * @param {boolean} readonly - display-only mode
 * @param {string} size - tailwind text size class
 */
const StarRating = ({ value = 0, onChange, readonly = false, size = "text-xl" }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= value : star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`${size} transition-colors duration-100 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${filled ? "text-yellow-400" : "text-zinc-600"}`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <FaStar />
          </button>
        );
      })}
      {readonly && value > 0 && (
        <span className="ml-1 text-sm text-zinc-400">({value.toFixed(1)})</span>
      )}
    </div>
  );
};

export default StarRating;
