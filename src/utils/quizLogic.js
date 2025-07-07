import shuffle from "lodash/shuffle";
import { 
  fetchPopularMovies, 
  fetchMovieImages, 
  fetchMovieDetails,
  TMDB_IMAGE_BASE 
} from '../utils/tmdbApi.js';

// Quiz logic utilities

// Generate a new quiz question
export const generateQuestion = async (language, usedMovieIds) => {
  try {
    // Get popular movies
    const data = await fetchPopularMovies(language);
    const movies = data.results;
    
    // Filter out movies we've already used
    const availableMovies = movies.filter(movie => !usedMovieIds.has(movie.id));
    
    // If we've used all movies, reset and use all movies
    const moviesToUse = availableMovies.length === 0 ? movies : availableMovies;
    
    // Pick a random movie from available ones
    const randomIndex = Math.floor(Math.random() * moviesToUse.length);
    const correct = moviesToUse[randomIndex];
    
    // Get images for the correct movie
    const imagesData = await fetchMovieImages(correct.id);
    
    // Use poster from images API, fallback to original poster if no images
    let movieImage = correct.poster_path;
    if (imagesData.posters && imagesData.posters.length > 0) {
      // Get a random poster from the images
      const randomPoster = imagesData.posters[Math.floor(Math.random() * imagesData.posters.length)];
      movieImage = randomPoster.file_path;
    }
    
    // Get different movies for distractors (excluding the correct one)
    const distractorPool = movies.filter(movie => movie.id !== correct.id);
    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle([correct, ...distractors]);

    return {
      question: {
        image: movieImage,
        answer: correct.title,
        options,
        correctId: correct.id
      },
      newUsedMovieId: correct.id,
      fullImageSrc: `${TMDB_IMAGE_BASE}${movieImage}`
    };
  } catch (error) {
    console.error("Failed to generate question:", error);
    throw error;
  }
};

// Translate current question to new language
export const translateQuestion = async (question, newLanguage) => {
  try {
    // Get translated titles for all current options
    const translatedOptions = await Promise.all(
      question.options.map(async (option) => {
        const movieDetails = await fetchMovieDetails(option.id, newLanguage);
        return {
          ...option,
          title: movieDetails.title || option.title // Fallback to original if translation fails
        };
      })
    );
    
    // Update the question with translated options and answer
    const correctOption = translatedOptions.find(opt => opt.id === question.correctId);
    
    return {
      ...question,
      options: translatedOptions,
      answer: correctOption ? correctOption.title : question.answer
    };
  } catch (error) {
    console.error("Failed to translate question:", error);
    throw error;
  }
};
