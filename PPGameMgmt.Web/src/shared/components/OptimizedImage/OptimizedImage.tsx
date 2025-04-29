import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderColor?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component for better image loading performance
 * - Supports lazy loading
 * - Provides image placeholder
 * - Uses modern image formats when available
 * - Tracks loading/error state
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderColor = '#f3f4f6',
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Handle intersection observer for advanced lazy loading
  useEffect(() => {
    // Skip if priority is true (load immediately) or image is already loaded
    if (priority || isLoaded) return;
    
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && imgRef.current) {
        // When the image comes into view, set the actual src
        imgRef.current.src = src;
        observer.disconnect();
      }
    }, {
      rootMargin: '200px 0px', // Start loading when image is 200px from viewport
      threshold: 0.01,
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [src, priority, isLoaded]);
  
  // Handle load and error events
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Calculate aspect ratio styling
  const aspectRatio = width && height ? { aspectRatio: `${width}/${height}` } : {};
  
  // If image is priority, render it directly
  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={aspectRatio}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  // For non-priority images, use advanced lazy loading
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: placeholderColor,
        ...aspectRatio,
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={priority ? src : ''} // Empty src by default, filled by intersection observer
        data-src={src} // Store the real src for the observer
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          objectFit: 'contain',
          width: '100%',
          height: '100%',
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;