'use client';

import { useState, useEffect, useRef } from 'react';
import { getYouTubeEmbedUrl } from '@/lib/tmdb/client';

interface TrailerPlayerProps {
  videoKey: string | null;
  isActive: boolean;
  muted?: boolean;
  onMuteToggle?: () => void;
}

export function TrailerPlayer({
  videoKey,
  isActive,
  muted = true,
  onMuteToggle,
}: TrailerPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && videoKey) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isActive, videoKey]);

  // Управление звуком через postMessage - применяем при изменении muted ИЛИ при загрузке нового видео
  useEffect(() => {
    if (!iframeRef.current) return;

    const timer = setTimeout(() => {
      const command = muted ? 'mute' : 'unMute';
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
    }, 500); // Даем время на загрузку iframe

    return () => clearTimeout(timer);
  }, [muted, videoKey]); // Добавляем videoKey чтобы применять при смене видео

  const handleLoad = () => {
    setIsLoading(false);
    // Сохраняем ссылку на плеер
    if (iframeRef.current) {
      playerRef.current = iframeRef.current;
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!videoKey || hasError) {
    return null; // Fallback to poster in parent component
  }

  // Всегда начинаем с muted в URL (YouTube требование для autoplay), но потом управляем через postMessage
  const embedUrl = `${getYouTubeEmbedUrl(videoKey, isActive, true)}&enablejsapi=1&vq=hd720`;

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Wrapper for object-fit cover on iframe */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-full pointer-events-none transform-gpu"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          style={{ border: 'none', minWidth: '100%', minHeight: '100%' }}
        />
      </div>

      {onMuteToggle && (
        <button
          onClick={onMuteToggle}
          className="absolute top-4 left-4 xs:top-6 xs:left-6 landscape:top-3 landscape:left-3 mt-safe bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white p-4 rounded-full transition-colors z-20 shadow-lg min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
