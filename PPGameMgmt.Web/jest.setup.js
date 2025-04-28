import '@testing-library/jest-dom';

// Mock matchMedia for components that might use media queries
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};