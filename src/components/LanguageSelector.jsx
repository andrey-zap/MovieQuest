import React from "react";

const LanguageSelector = ({ 
  languages, 
  selectedLanguage, 
  showLanguageSelector, 
  onToggleSelector, 
  onLanguageChange 
}) => {
  return (
    <div className="relative">
      {showLanguageSelector && (
        <div className="absolute top-full left-0 mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-2 max-h-48 overflow-y-auto min-w-32">
          {languages.map((lang) => (
            <button
              key={lang.iso_639_1}
              onClick={() => onLanguageChange(lang.iso_639_1)}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-blue-50 transition-colors ${
                (selectedLanguage === lang.iso_639_1 || selectedLanguage === 'en-US' && lang.iso_639_1 === 'en')
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700'
              }`}
            >
              {lang.english_name}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={onToggleSelector}
        className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg shadow-lg border border-white/20 transition-all duration-200 hover:scale-105 text-sm font-semibold"
        title="Change language"
      >
        🌐 {languages.find(lang => lang.iso_639_1 === selectedLanguage.split('-')[0])?.english_name || 'English'}
      </button>
    </div>
  );
};

export default LanguageSelector;
