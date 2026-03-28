import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

export interface PlayerTrack {
  id: string;
  title: string;
  artist?: string;
  artwork?: string;
  source: 'bible' | 'devotional' | 'sermon';
  type: 'text' | 'audio' | 'youtube';
  content?: string; // For text-to-speech
  audioUrl?: string; // For audio files
  youtubeUrl?: string; // For YouTube videos
  metadata?: any;
}

export interface PlayerState {
  currentTrack: PlayerTrack | null;
  queue: PlayerTrack[];
  isPlaying: boolean;
  isPaused: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  voiceSettings: {
    accent: string;
    gender: 'male' | 'female';
  };
}

interface GlobalPlayerContextType {
  playerState: PlayerState;
  play: (track?: PlayerTrack) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  seekBy: (seconds: number) => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  addToQueue: (tracks: PlayerTrack[]) => void;
  clearQueue: () => void;
  updateVoiceSettings: (settings: Partial<PlayerState['voiceSettings']>) => Promise<void>;
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType | undefined>(undefined);

export function GlobalPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    isPaused: false,
    position: 0,
    duration: 0,
    playbackSpeed: 1.0,
    volume: 1.0,
    voiceSettings: {
      accent: 'es',  // Default to Spanish
      gender: 'female',
    },
  });

  const positionInterval = useRef<NodeJS.Timeout | null>(null);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
    return () => {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
    };
  }, []);

  const loadPreferences = async () => {
    try {
      const [speed, voice, gender] = await Promise.all([
        AsyncStorage.getItem('player_playback_speed'),
        AsyncStorage.getItem('player_voice_accent'),
        AsyncStorage.getItem('player_voice_gender'),
      ]);

      setPlayerState(prev => ({
        ...prev,
        playbackSpeed: speed ? parseFloat(speed) : 1.0,
        voiceSettings: {
          accent: voice || 'es',  // Default to Spanish
          gender: (gender as 'male' | 'female') || 'female',
        },
      }));
    } catch (error) {
      console.error('Error loading player preferences:', error);
    }
  };

  const getVoiceOptions = useCallback(() => {
    const { accent, gender } = playerState.voiceSettings;
    const voiceMap: Record<string, Record<string, string>> = {
      'es': { male: 'es-us-x-sfb', female: 'es-us-x-sfd' },  // Spanish (default)
      'en-US': { male: 'en-us-x-iob', female: 'en-us-x-iog' },  // English US
      'es-MX': { male: 'es-mx-x-loc', female: 'es-mx-x-ana' },
      'es-ES': { male: 'es-es-x-eee-local', female: 'es-es-x-eef-local' },
      'es-US': { male: 'es-us-x-esb-local', female: 'es-us-x-esc-local' },
      'es-AR': { male: 'es-ar-x-sfb', female: 'es-ar-x-sfc' },
      'es-CO': { male: 'es-co-x-jmc', female: 'es-co-x-jmd' },
      'es-VE': { male: 'es-ve-x-veb', female: 'es-ve-x-vec' },
    };
    return voiceMap[accent]?.[gender] || voiceMap['es'][gender];
  }, [playerState.voiceSettings]);

  const getLanguageCode = useCallback(() => {
    const langMap: Record<string, string> = {
      'es': 'es',  // Spanish (default)
      'en-US': 'en-US',  // English US
      'es-MX': 'es-MX',
      'es-ES': 'es-ES',
      'es-US': 'es-US',
      'es-AR': 'es-AR',
      'es-CO': 'es-CO',
      'es-VE': 'es-VE',
    };
    return langMap[playerState.voiceSettings.accent] || 'es';
  }, [playerState.voiceSettings.accent]);

  const play = async (track?: PlayerTrack) => {
    try {
      // Stop current playback
      if (playerState.isPlaying) {
        await Speech.stop();
      }

      const trackToPlay = track || playerState.currentTrack;
      if (!trackToPlay) return;

      setPlayerState(prev => ({
        ...prev,
        currentTrack: trackToPlay,
        isPlaying: true,
        isPaused: false,
        position: 0,
      }));

      if (trackToPlay.type === 'text' && trackToPlay.content) {
        // Text-to-speech playback
        await Speech.speak(trackToPlay.content, {
          language: getLanguageCode(),
          voice: getVoiceOptions(),
          pitch: 1.0,
          rate: playerState.playbackSpeed * 0.9, // Adjust rate for Speech API
          onDone: () => {
            setPlayerState(prev => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
            }));
            // Auto-play next if available
            if (playerState.queue.length > 0) {
              const currentIndex = playerState.queue.findIndex(t => t.id === trackToPlay.id);
              if (currentIndex < playerState.queue.length - 1) {
                playNext();
              }
            }
          },
          onError: (error) => {
            console.error('Speech error:', error);
            setPlayerState(prev => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
            }));
          },
        });

        // Start position tracking
        if (positionInterval.current) {
          clearInterval(positionInterval.current);
          positionInterval.current = null;
        }
        const interval = setInterval(() => {
          setPlayerState(prev => ({
            ...prev,
            position: prev.position + 1,
          }));
        }, 1000);
        positionInterval.current = interval;
      } else if (trackToPlay.type === 'audio' && trackToPlay.audioUrl) {
        // TODO: Implement audio playback with expo-av or react-native-track-player
        console.log('Audio playback not yet implemented');
      } else if (trackToPlay.type === 'youtube' && trackToPlay.youtubeUrl) {
        // TODO: Implement YouTube playback
        console.log('YouTube playback not yet implemented');
      }
    } catch (error) {
      console.error('Error playing track:', error);
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
      }));
    }
  };

  const pause = async () => {
    try {
      if (playerState.currentTrack?.type === 'text') {
        // Speech.pause() is not supported on all platforms, use stop instead
        await Speech.stop();
      }
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
      setPlayerState(prev => ({
        ...prev,
        isPlaying: true, // Keep isPlaying true but set isPaused
        isPaused: true,
      }));
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const resume = async () => {
    try {
      if (playerState.currentTrack?.type === 'text' && playerState.currentTrack.content) {
        // Speech.resume() is not supported, restart from where we left off
        // For simplicity, we'll restart the speech
        await Speech.speak(playerState.currentTrack.content, {
          language: getLanguageCode(),
          voice: getVoiceOptions(),
          pitch: 1.0,
          rate: playerState.playbackSpeed * 0.9,
          onDone: () => {
            setPlayerState(prev => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
            }));
          },
          onError: (error) => {
            console.error('Speech error:', error);
            setPlayerState(prev => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
            }));
          },
        });
      }
      // Restart position tracking
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
      const interval = setInterval(() => {
        setPlayerState(prev => ({
          ...prev,
          position: prev.position + 1,
        }));
      }, 1000);
      positionInterval.current = interval;
      setPlayerState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
      }));
    } catch (error) {
      console.error('Error resuming:', error);
    }
  };

  const stop = async () => {
    try {
      if (playerState.currentTrack?.type === 'text') {
        await Speech.stop();
      }
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
      setPlayerState(prev => ({
        ...prev,
        currentTrack: null, // Clear the current track
        isPlaying: false,
        isPaused: false,
        position: 0,
      }));
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  const seekTo = async (position: number) => {
    // Text-to-speech doesn't support seeking, so we'll restart from beginning
    if (playerState.currentTrack?.type === 'text') {
      console.log('Seeking not supported for text-to-speech');
    }
    setPlayerState(prev => ({
      ...prev,
      position: Math.max(0, Math.min(position, prev.duration)),
    }));
  };

  const seekBy = async (seconds: number) => {
    await seekTo(playerState.position + seconds);
  };

  const setPlaybackSpeed = async (speed: number) => {
    try {
      await AsyncStorage.setItem('player_playback_speed', speed.toString());
      setPlayerState(prev => ({
        ...prev,
        playbackSpeed: speed,
      }));
      // If currently playing text, restart with new speed
      if (playerState.isPlaying && playerState.currentTrack?.type === 'text') {
        await stop();
        await play();
      }
    } catch (error) {
      console.error('Error setting playback speed:', error);
    }
  };

  const setVolume = async (volume: number) => {
    setPlayerState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
    }));
  };

  const playNext = async () => {
    const currentIndex = playerState.queue.findIndex(t => t.id === playerState.currentTrack?.id);
    if (currentIndex < playerState.queue.length - 1) {
      await play(playerState.queue[currentIndex + 1]);
    }
  };

  const playPrevious = async () => {
    const currentIndex = playerState.queue.findIndex(t => t.id === playerState.currentTrack?.id);
    if (currentIndex > 0) {
      await play(playerState.queue[currentIndex - 1]);
    }
  };

  const addToQueue = (tracks: PlayerTrack[]) => {
    setPlayerState(prev => ({
      ...prev,
      queue: [...prev.queue, ...tracks],
    }));
  };

  const clearQueue = () => {
    setPlayerState(prev => ({
      ...prev,
      queue: [],
    }));
  };

  const updateVoiceSettings = async (settings: Partial<PlayerState['voiceSettings']>) => {
    try {
      if (settings.accent) {
        await AsyncStorage.setItem('player_voice_accent', settings.accent);
      }
      if (settings.gender) {
        await AsyncStorage.setItem('player_voice_gender', settings.gender);
      }
      setPlayerState(prev => ({
        ...prev,
        voiceSettings: {
          ...prev.voiceSettings,
          ...settings,
        },
      }));
    } catch (error) {
      console.error('Error updating voice settings:', error);
    }
  };

  return (
    <GlobalPlayerContext.Provider
      value={{
        playerState,
        play,
        pause,
        resume,
        stop,
        seekTo,
        seekBy,
        setPlaybackSpeed,
        setVolume,
        playNext,
        playPrevious,
        addToQueue,
        clearQueue,
        updateVoiceSettings,
      }}
    >
      {children}
    </GlobalPlayerContext.Provider>
  );
}

export function useGlobalPlayer() {
  const context = useContext(GlobalPlayerContext);
  if (!context) {
    throw new Error('useGlobalPlayer must be used within GlobalPlayerProvider');
  }
  return context;
}