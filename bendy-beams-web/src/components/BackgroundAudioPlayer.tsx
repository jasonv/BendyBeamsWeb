import React, { useState, useEffect, useRef } from 'react';

interface BackgroundAudioPlayerProps {
  audioUrl: string;
}

const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // (Re)create audio element when audioUrl changes
  useEffect(() => {
    // Clean up any old audio object
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    const audio = new window.Audio(audioUrl);
    audio.loop = true;

    // Handle error loading audio
    const handleError = () => {
      setAudioError("Audio not found or failed to load.");
      setIsPlaying(false);
    };
    audio.addEventListener('error', handleError);

    audioRef.current = audio;
    setAudioError(null);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  // Control playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(err => {
        setAudioError("Unable to play audio. " + err.message);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div>
      <a href="#" id="soundButton" onClick={togglePlayback}>
        {isPlaying ? 'Sound' : 'Sound'}
      </a>
      {audioError && <div style={{ color: 'red' }}>{audioError}</div>}
    </div>
  );
};

export default BackgroundAudioPlayer;
