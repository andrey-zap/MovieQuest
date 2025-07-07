import React, { useEffect, useState } from "react";
import shuffle from "lodash/shuffle";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_POPULAR_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`;
const TMDB_IMAGES_URL = (movieId) => `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${TMDB_API_KEY}`;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieQuiz() {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [usedMovieIds, setUsedMovieIds] = useState(new Set());
  const [backgroundGradient, setBackgroundGradient] = useState("linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.35) 50%, rgba(110, 100, 198, 0.3) 100%)");
  const [isCorrect, setIsCorrect] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Function to play success sound
  const playSuccessSound = () => {
    if (!isSoundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a sequence of ascending notes for success
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      let time = audioContext.currentTime;
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, time);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        oscillator.start(time);
        oscillator.stop(time + 0.3);
        
        time += 0.15;
      });
    } catch (error) {
      console.log("Could not play success sound:", error);
    }
  };

  // Function to play failure sound
  const playFailureSound = () => {
    if (!isSoundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a descending "buzzer" sound for failure
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Could not play failure sound:", error);
    }
  };

  // Function to toggle sound on/off
  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  // Function to extract dominant colors from image and create background
  const extractColorsAndSetBackground = (imageSrc) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to a smaller version for faster processing
        canvas.width = 100;
        canvas.height = 150;
        
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract colors by sampling pixels
        const colors = [];
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          // Skip transparent pixels
          if (alpha > 128) {
            colors.push({ r, g, b });
          }
        }
        
        // Calculate average colors for gradient
        if (colors.length > 0) {
          const avgColor1 = colors.reduce((acc, color, index) => {
            if (index < colors.length / 2) {
              acc.r += color.r;
              acc.g += color.g;
              acc.b += color.b;
              acc.count++;
            }
            return acc;
          }, { r: 0, g: 0, b: 0, count: 0 });
          
          const avgColor2 = colors.reduce((acc, color, index) => {
            if (index >= colors.length / 2) {
              acc.r += color.r;
              acc.g += color.g;
              acc.b += color.b;
              acc.count++;
            }
            return acc;
          }, { r: 0, g: 0, b: 0, count: 0 });
          
          // Calculate final colors with some opacity for subtlety
          const color1 = {
            r: Math.round(avgColor1.r / avgColor1.count),
            g: Math.round(avgColor1.g / avgColor1.count),
            b: Math.round(avgColor1.b / avgColor1.count)
          };
          
          const color2 = {
            r: Math.round(avgColor2.r / avgColor2.count),
            g: Math.round(avgColor2.g / avgColor2.count),
            b: Math.round(avgColor2.b / avgColor2.count)
          };
          
          // Create a more visible gradient with higher opacity and enhanced colors
          const gradient = `linear-gradient(135deg, 
            rgba(${color1.r}, ${color1.g}, ${color1.b}, 0.4) 0%, 
            rgba(${color2.r}, ${color2.g}, ${color2.b}, 0.35) 30%,
            rgba(${Math.round((color1.r + color2.r) / 2)}, ${Math.round((color1.g + color2.g) / 2)}, ${Math.round((color1.b + color2.b) / 2)}, 0.3) 70%,
            rgba(${Math.round(color1.r * 0.8)}, ${Math.round(color1.g * 0.8)}, ${Math.round(color1.b * 0.8)}, 0.25) 100%)`;
          
          setBackgroundGradient(gradient);
        }
      } catch (error) {
        console.log("Could not extract colors from image:", error);
        // Fallback to default gradient
        setBackgroundGradient("linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.35) 50%, rgba(110, 100, 198, 0.3) 100%)");
      }
    };
    
    img.onerror = () => {
      console.log("Could not load image for color extraction");
      setBackgroundGradient("linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.35) 50%, rgba(110, 100, 198, 0.3) 100%)");
    };
    
    img.src = imageSrc;
  };

  const fetchQuestion = async () => {
    try {
      // First, get popular movies to choose from
      const res = await fetch(TMDB_POPULAR_URL);
      const data = await res.json();
      const movies = data.results;
      
      // Filter out movies we've already used
      const availableMovies = movies.filter(movie => !usedMovieIds.has(movie.id));
      
      // If we've used all movies, reset the used set
      if (availableMovies.length === 0) {
        setUsedMovieIds(new Set());
        availableMovies.push(...movies);
      }
      
      // Pick a random movie from available ones
      const randomIndex = Math.floor(Math.random() * availableMovies.length);
      const correct = availableMovies[randomIndex];
      
      // Add this movie to used set
      setUsedMovieIds(prev => new Set([...prev, correct.id]));
      
      // Get images for the correct movie
      const imagesRes = await fetch(TMDB_IMAGES_URL(correct.id));
      const imagesData = await imagesRes.json();
      
      // Use poster from images API, fallback to original poster if no images
      let movieImage = correct.poster_path;
      if (imagesData.posters && imagesData.posters.length > 0) {
        // Get a random poster from the images
        const randomPoster = imagesData.posters[Math.floor(Math.random() * imagesData.posters.length)];
        movieImage = randomPoster.file_path;
      }
      
      // Get different movies for distractors (excluding the correct one and used ones)
      const distractorPool = movies.filter(movie => movie.id !== correct.id);
      const distractors = shuffle(distractorPool).slice(0, 3);
      const options = shuffle([correct, ...distractors]);

      setQuestion({
        image: movieImage,
        answer: correct.title,
        options,
      });
      setSelected(null);
      setFeedback("");
      setIsCorrect(null);
      
      // Extract colors from the image and set background
      const fullImageSrc = `${TMDB_IMAGE_BASE}${movieImage}`;
      extractColorsAndSetBackground(fullImageSrc);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setFeedback("Error loading movie data.");
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswer = (option) => {
    setSelected(option);
    const correct = option === question.answer;
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
      playSuccessSound();
    } else {
      playFailureSound();
    }
    
    // Automatically load next question after a short delay
    setTimeout(() => {
      fetchQuestion();
    }, 1500); // 1.5 second delay to show feedback
  };

  if (!question) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-purple-600">
      <div className="text-white text-xl sm:text-2xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 lg:p-6 space-y-4 transition-all duration-1000 ease-in-out relative"
      style={{ 
        background: backgroundGradient,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Volume Toggle Button */}
      <button
        onClick={toggleSound}
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

      {/* Score Counter */}
      <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold text-sm sm:text-base">Score:</span>
          <span className="text-blue-600 font-bold text-lg sm:text-xl">{correctCount}</span>
          <span className="text-gray-500 font-medium text-sm sm:text-base">/</span>
          <span className="text-gray-600 font-semibold text-lg sm:text-xl">{totalCount}</span>
        </div>
      </div>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20 mx-auto">
        <div className="flex flex-col items-center p-3 sm:p-4 md:p-6">
          <img
            src={`${TMDB_IMAGE_BASE}${question.image}`}
            alt="movie poster"
            className={`w-full max-w-sm rounded transition-all duration-500 ${
              isCorrect === true 
                ? 'border-4 border-green-500 shadow-lg shadow-green-500/50' 
                : isCorrect === false 
                ? 'border-4 border-red-500 shadow-lg shadow-red-500/50'
                : 'border-2 border-transparent'
            }`}
          />
          <div className="mt-3 sm:mt-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {question.options.map((opt, index) => (
                <button
                  key={opt.title}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 px-2 sm:px-3 rounded text-xs sm:text-sm md:text-base disabled:opacity-50 transition-all duration-200 hover:shadow-lg active:scale-98 min-h-[44px] sm:min-h-[52px]"
                  onClick={() => handleAnswer(opt.title)}
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
            <p className={`mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-center transition-all duration-300 ${
              isCorrect === true ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
