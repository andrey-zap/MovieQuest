import React from "react";

const SoundToggleButton = ({ isSoundEnabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-2 sm:p-3 rounded-full shadow-lg border border-white/20 transition-all duration-200 hover:scale-110"
      title={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
    >
      {isSoundEnabled ? (
        // Volume On Icon
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      ) : (
        // Volume Off Icon
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      )}
    </button>
  );
};

export default SoundToggleButton;
