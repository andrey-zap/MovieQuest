import React from "react";
import { TMDB_IMAGE_BASE } from "../utils/tmdbApi.js";

const QuizCard = ({ question, isCorrect, selected, feedback, onAnswer }) => {
  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20 mx-auto">
      <div className="flex flex-col items-center p-2 sm:p-3 md:p-4">
        <img
          src={`${TMDB_IMAGE_BASE}${question.image}`}
          alt="movie poster"
          className={`w-full max-w-xs sm:max-w-sm rounded transition-all duration-500 ${
            isCorrect === true 
              ? 'border-4 border-green-500 shadow-lg shadow-green-500/50' 
              : isCorrect === false 
              ? 'border-4 border-red-500 shadow-lg shadow-red-500/50'
              : 'border-2 border-transparent'
          }`}
        />
        <div className="mt-2 sm:mt-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {question.options.map((opt, index) => (
              <button
                key={opt.title}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 px-2 sm:px-3 rounded text-xs sm:text-sm md:text-base disabled:opacity-50 transition-all duration-200 hover:shadow-lg active:scale-98 min-h-[44px] sm:min-h-[52px]"
                onClick={() => onAnswer(opt.title)}
                disabled={selected !== null}
              >
                <span className="block text-center leading-tight">
                  {opt.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        {feedback && (
          <p className={`mt-2 sm:mt-3 text-base sm:text-lg font-semibold text-center transition-all duration-300 ${
            isCorrect === true ? 'text-green-600' : 'text-red-600'
          }`}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
