// TMDB API utilities and endpoints
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// API endpoint builders
export const TMDB_ENDPOINTS = {
  popular: (language = 'en-US') => 
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${language}`,
  movieDetails: (movieId, language = 'en-US') => 
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${language}`,
  movieImages: (movieId) => 
    `${TMDB_BASE_URL}/movie/${movieId}/images?api_key=${TMDB_API_KEY}`,
  languages: () => 
    `${TMDB_BASE_URL}/configuration/languages?api_key=${TMDB_API_KEY}`
};

// Popular languages for the language selector
export const POPULAR_LANGUAGES = [
  { iso_639_1: 'en', english_name: 'English', name: 'English' },
  { iso_639_1: 'es', english_name: 'Spanish', name: 'Español' },
  { iso_639_1: 'fr', english_name: 'French', name: 'Français' },
  { iso_639_1: 'de', english_name: 'German', name: 'Deutsch' },
  { iso_639_1: 'it', english_name: 'Italian', name: 'Italiano' },
  { iso_639_1: 'pt', english_name: 'Portuguese', name: 'Português' },
  { iso_639_1: 'ru', english_name: 'Russian', name: 'Pусский' },
  { iso_639_1: 'ja', english_name: 'Japanese', name: '日本語' },
  { iso_639_1: 'ko', english_name: 'Korean', name: '한국어' },
  { iso_639_1: 'zh', english_name: 'Chinese', name: '中文' },
  { iso_639_1: 'hi', english_name: 'Hindi', name: 'हिन्दी' },
  { iso_639_1: 'ar', english_name: 'Arabic', name: 'العربية' }
];

// Fetch popular movies
export const fetchPopularMovies = async (language = 'en-US') => {
  const response = await fetch(TMDB_ENDPOINTS.popular(language));
  if (!response.ok) {
    throw new Error('Failed to fetch popular movies');
  }
  return response.json();
};

// Fetch movie details
export const fetchMovieDetails = async (movieId, language = 'en-US') => {
  const response = await fetch(TMDB_ENDPOINTS.movieDetails(movieId, language));
  if (!response.ok) {
    throw new Error(`Failed to fetch movie details for ID ${movieId}`);
  }
  return response.json();
};

// Fetch movie images
export const fetchMovieImages = async (movieId) => {
  const response = await fetch(TMDB_ENDPOINTS.movieImages(movieId));
  if (!response.ok) {
    throw new Error(`Failed to fetch movie images for ID ${movieId}`);
  }
  return response.json();
};

// Fetch available languages
export const fetchLanguages = async () => {
  try {
    const response = await fetch(TMDB_ENDPOINTS.languages());
    if (!response.ok) {
      throw new Error('Failed to fetch languages');
    }
    // Return popular languages instead of full API response for better UX
    return POPULAR_LANGUAGES;
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    // Fallback to English only
    return [{ iso_639_1: 'en', english_name: 'English', name: 'English' }];
  }
};
