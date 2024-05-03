function debounce(func, wait) {
  console.log("debounce called");
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function roundSlides(slidesString, defaultNum = 1) {
  // Parse the input string as a floating-point number
  const slides = parseFloat(slidesString);

  // Check if the parsed value is a valid number
  if (isNaN(slides)) {
    // Return default values based on the specified size
    return defaultNum;
  }

  // Round the parsed value to one decimal place
  const roundedSlides = Math.round(slides * 10) / 10;
  return roundedSlides;
}
