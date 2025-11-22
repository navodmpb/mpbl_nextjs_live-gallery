'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const ANIMATIONS = ['entering', 'popup', 'spin', 'zoom', 'swing', 'float', 'bounce', 'flip', 'rotate'];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [floatingPhotos, setFloatingPhotos] = useState([]);
  const [particles, setParticles] = useState([]);
  const [photoAnimations, setPhotoAnimations] = useState({});
  const [randomAnimations, setRandomAnimations] = useState({});
  const knownIds = useRef(new Set());

  // Create gold particles on mount
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
    }));
    setParticles(newParticles);
  }, []);

  // Add floating photo
  const addFloatingPhoto = useCallback((url) => {
    const newFloat = {
      id: Date.now() + Math.random(),
      url,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 20 + Math.random() * 20,
    };
    setFloatingPhotos(prev => {
      const updated = [...prev, newFloat];
      return updated.slice(-30); // Keep max 30 floating photos
    });
  }, []);

  // Fetch photos from API
  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      if (data.photos) {
        setPhotos(prev => {
          const newPhotos = data.photos.filter(p => !knownIds.current.has(p.id));
          
          // Add animations and effects for new photos
          newPhotos.forEach(photo => {
            knownIds.current.add(photo.id);
            const randomAnim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
            setPhotoAnimations(anims => ({ ...anims, [photo.id]: randomAnim }));
            addFloatingPhoto(photo.url);
          });

          if (newPhotos.length > 0) {
            console.log(`✨ ${newPhotos.length} new photos added!`);
            // Set current index to 0 to show the newest photo first
            setCurrentIndex(0);
            
            // Remove animation after 3 seconds (short pause)
            setTimeout(() => {
              setPhotoAnimations(anims => {
                const updated = { ...anims };
                newPhotos.forEach(photo => {
                  delete updated[photo.id];
                });
                return updated;
              });
            }, 3000); // Short 3-second pause for new photo
          }

          return data.photos;
        });
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [addFloatingPhoto]);

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 5000);
    return () => clearInterval(interval);
  }, [fetchPhotos]);

  // Initialize floating photos from existing photos
  useEffect(() => {
    if (photos.length > 0 && floatingPhotos.length < 15) {
      const initial = photos.slice(0, 15).map((p, i) => ({
        id: `init-${i}`,
        url: p.url,
        left: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 20 + Math.random() * 20,
      }));
      setFloatingPhotos(initial);
    }
  }, [photos.length]);

  // Periodically add random floating photos
  useEffect(() => {
    const interval = setInterval(() => {
      if (photos.length > 0 && Math.random() > 0.7) {
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        addFloatingPhoto(randomPhoto.url);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [photos, addFloatingPhoto]);

  // Random animations for existing photos
  useEffect(() => {
    const interval = setInterval(() => {
      if (photos.length > 0 && Math.random() > 0.8) { // 20% chance every interval
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        const randomAnim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
        
        setRandomAnimations(prev => ({
          ...prev,
          [randomPhoto.id]: randomAnim
        }));

        // Remove animation after 2 seconds
        setTimeout(() => {
          setRandomAnimations(prev => {
            const updated = { ...prev };
            delete updated[randomPhoto.id];
            return updated;
          });
        }, 2000);
      }
    }, 4000); // Every 4 seconds check for random animation

    return () => clearInterval(interval);
  }, [photos]);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [photos.length]);

  // Get position class for each card
  const getPositionClass = (index) => {
    const len = photos.length;
    if (len === 0) return 'hidden';
    const rel = ((index - currentIndex) % len + len) % len;
    if (rel === 0) return 'center';
    if (rel === 1) return 'right-1';
    if (rel === 2) return 'right-2';
    if (rel === 3) return 'right-3';
    if (rel === len - 1) return 'left-1';
    if (rel === len - 2) return 'left-2';
    if (rel === len - 3) return 'left-3';
    return 'hidden';
  };

  // Fullscreen toggle
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'f' || e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  if (error) return <div className="loading">Error: {error}</div>;

  return (
    <main>
      {/* Background Effects */}
      <div id="background-effects">
        <div className="neon-wave"></div>
        <div className="neon-wave"></div>
        <div className="neon-wave"></div>
        
        {/* Gold Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="gold-particle"
            style={{ left: `${p.left}vw`, animationDelay: `${p.delay}s` }}
          />
        ))}
      </div>

      <div className="ambient-light"></div>

      {/* Floating Photo Wall */}
      <div id="floating-wall">
        {floatingPhotos.map(fp => (
          <div
            key={fp.id}
            className="floating-photo"
            style={{
              left: `${fp.left}vw`,
              animationDelay: `${fp.delay}s`,
              animationDuration: `${fp.duration}s`,
            }}
          >
            <img src={fp.url} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div id="header">
        <h1>Live Photo Gallery</h1>
      </div>

      {/* Photo Counter */}
      <div className="photo-counter">
        Photos: {photos.length} | Current: {photos.length > 0 ? currentIndex + 1 : 0}/{photos.length}
      </div>

      {/* Gallery */}
      <div id="gallery-space">
        <div id="carousel-wrapper">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`glass-card ${getPositionClass(index)} ${photoAnimations[photo.id] || ''} ${randomAnimations[photo.id] || ''}`}
            >
              <div className="photo-container">
                <img src={photo.url} alt={photo.name} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Info */}
      <div id="event-info">
        <h2>MPBL - ANNUAL GET TOGETHER & CHRISTMAS PARTY</h2>
        <p>2025</p>
      </div>

      {/* Preview Strip */}
      <div id="preview-strip">
        {photos.slice(0, 15).map((photo, index) => (
          <div
            key={photo.id}
            className={`preview-thumb ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          >
            <img src={photo.url} alt={photo.name} loading="lazy" />
          </div>
        ))}
      </div>

      <div className="reflection"></div>

      {loading && <div className="loading">Loading photos...</div>}
    </main>
  );
}