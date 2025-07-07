import React from "react";
import { useMovieQuiz } from "./hooks/useMovieQuiz.js";
import LoadingScreen from "./components/LoadingScreen.jsx";
import SoundToggleButton from "./components/SoundToggleButton.jsx";
import ScoreCounter from "./components/ScoreCounter.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import QuizCard from "./components/QuizCard.jsx";

export default function MovieQuiz() {
  const {
    question,
    selected,
    feedback,
    isCorrect,
    backgroundGradient,
    isSoundEnabled,
    correctCount,
    totalCount,
    selectedLanguage,
    languages,
    showLanguageSelector,
    handleAnswer,
    handleLanguageChange,
    toggleSound,
    toggleLanguageSelector
  } = useMovieQuiz();

  if (!question) {
    return <LoadingScreen />;
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-1 sm:p-2 lg:p-4 space-y-2 sm:space-y-3 transition-all duration-1000 ease-in-out relative"
      style={{ 
        background: backgroundGradient,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sound Toggle Button */}
      <SoundToggleButton 
        isSoundEnabled={isSoundEnabled} 
        onToggle={toggleSound} 
      />

      {/* Score Counter and Language Selector */}
      <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col space-y-2">
        <ScoreCounter 
          correctCount={correctCount} 
          totalCount={totalCount} 
        />
        
        <LanguageSelector
          languages={languages}
          selectedLanguage={selectedLanguage}
          showLanguageSelector={showLanguageSelector}
          onToggleSelector={toggleLanguageSelector}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Quiz Card */}
      <QuizCard
        question={question}
        isCorrect={isCorrect}
        selected={selected}
        feedback={feedback}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
