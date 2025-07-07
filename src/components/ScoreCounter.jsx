import React from "react";

const ScoreCounter = ({ correctCount, totalCount }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 font-semibold text-sm sm:text-base">Score:</span>
        <span className="text-blue-600 font-bold text-lg sm:text-xl">{correctCount}</span>
        <span className="text-gray-500 font-medium text-sm sm:text-base">/</span>
        <span className="text-gray-600 font-semibold text-lg sm:text-xl">{totalCount}</span>
      </div>
    </div>
  );
};

export default ScoreCounter;
