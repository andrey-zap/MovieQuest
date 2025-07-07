import { useState, useEffect } from "react";
import { fetchLanguages } from "../utils/tmdbApi.js";
import { generateQuestion, translateQuestion } from "../utils/quizLogic.js";
import { extractColorsAndCreateGradient, getDefaultGradient } from "../utils/colorUtils.js";
import { playSuccessSound, playFailureSound } from "../utils/audioUtils.js";

export const useMovieQuiz = () => {
  // Core quiz state
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [usedMovieIds, setUsedMovieIds] = useState(new Set());
  const [isCorrect, setIsCorrect] = useState(null);
  
  // UI state
  const [backgroundGradient, setBackgroundGradient] = useState(getDefaultGradient());
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // Score state
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [languages, setLanguages] = useState([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        const languageData = await fetchLanguages();
        setLanguages(languageData);
        await loadNewQuestion();
      } catch (error) {
        console.error("Failed to initialize quiz:", error);
      }
    };
    
    initializeQuiz();
  }, []);

  // Load a new question
  const loadNewQuestion = async (language = selectedLanguage) => {
    try {
      const { question: newQuestion, newUsedMovieId, fullImageSrc } = await generateQuestion(language, usedMovieIds);
      
      setQuestion(newQuestion);
      setSelected(null);
      setFeedback("");
      setIsCorrect(null);
      
      // Update used movies
      setUsedMovieIds(prev => {
        const newSet = new Set(prev);
        newSet.add(newUsedMovieId);
        // Reset if we've used all movies
        if (newSet.size >= 20) { // Reset after 20 movies to keep variety
          return new Set([newUsedMovieId]);
        }
        return newSet;
      });
      
      // Extract colors for background
      extractColorsAndCreateGradient(fullImageSrc, setBackgroundGradient);
    } catch (error) {
      console.error("Failed to load new question:", error);
      setFeedback("Error loading movie data.");
    }
  };

  // Handle answer selection
  const handleAnswer = (selectedOption) => {
    setSelected(selectedOption);
    const correct = selectedOption === question.answer;
    setIsCorrect(correct);
    setFeedback(
      correct
        ? "Correct!"
        : `Wrong! It was: ${question.answer}`
    );
    
    // Update counters
    setTotalCount(prev => prev + 1);
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
    
    // Play appropriate sound
    if (correct) {
      playSuccessSound(isSoundEnabled);
    } else {
      playFailureSound(isSoundEnabled);
    }
    
    // Automatically load next question after a short delay
    setTimeout(() => {
      loadNewQuestion();
    }, 1500);
  };

  // Handle language change
  const handleLanguageChange = async (languageCode) => {
    const newLanguage = languageCode === 'en' ? 'en-US' : languageCode;
    setSelectedLanguage(newLanguage);
    setShowLanguageSelector(false);
    
    // If we have a current question, translate it to the new language
    if (question && question.options) {
      try {
        const translatedQuestion = await translateQuestion(question, newLanguage);
        setQuestion(translatedQuestion);
        
        // Reset selection state since options have changed
        setSelected(null);
        setFeedback("");
        setIsCorrect(null);
      } catch (error) {
        console.error("Failed to translate current question:", error);
      }
    }
    
    // Reset used movies for future questions in the new language
    setUsedMovieIds(new Set());
  };

  // Toggle sound
  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  // Toggle language selector
  const toggleLanguageSelector = () => {
    setShowLanguageSelector(prev => !prev);
  };

  return {
    // State
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
    
    // Actions
    handleAnswer,
    handleLanguageChange,
    toggleSound,
    toggleLanguageSelector
  };
};
