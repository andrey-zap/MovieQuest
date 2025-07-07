// Color extraction utilities for dynamic backgrounds

// Function to extract dominant colors from image and create background gradient
export const extractColorsAndCreateGradient = (imageSrc, callback) => {
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
        
        callback(gradient);
      } else {
        callback(getDefaultGradient());
      }
    } catch (error) {
      console.log("Could not extract colors from image:", error);
      callback(getDefaultGradient());
    }
  };
  
  img.onerror = () => {
    console.log("Could not load image for color extraction");
    callback(getDefaultGradient());
  };
  
  img.src = imageSrc;
};

// Default gradient fallback
export const getDefaultGradient = () => {
  return "linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.35) 50%, rgba(110, 100, 198, 0.3) 100%)";
};
