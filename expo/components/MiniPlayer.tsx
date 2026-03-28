import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
  RotateCcw,
  RotateCw,
} from 'lucide-react-native';
import { useGlobalPlayer } from '@/providers/GlobalPlayerProvider';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { BlurView } from 'expo-blur';

export default function MiniPlayer() {
  const { playerState, pause, resume, stop, seekBy, setPlaybackSpeed, playNext, playPrevious } = useGlobalPlayer();
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [slideAnim] = useState(new Animated.Value(100));
  const [expandAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate mini-player visibility
    Animated.timing(slideAnim, {
      toValue: playerState.currentTrack ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [playerState.currentTrack, slideAnim]);

  useEffect(() => {
    // Animate expansion
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  if (!playerState.currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (playerState.isPlaying && !playerState.isPaused) {
      pause();
    } else if (playerState.isPaused) {
      resume();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const expandedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 120],
  });

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          height: expandedHeight,
          backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        },
      ]}
    >
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={80}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      
      <View style={styles.content}>
        {/* Main Controls Row */}
        <View style={styles.mainRow}>
          <View style={styles.trackInfo}>
            <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
              {playerState.currentTrack.title}
            </Text>
            {playerState.currentTrack.artist && (
              <Text style={[styles.trackArtist, { color: colors.tabIconDefault }]} numberOfLines={1}>
                {playerState.currentTrack.artist}
              </Text>
            )}
          </View>

          <View style={styles.controls}>
            {/* Previous */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={playPrevious}
              disabled={playerState.queue.findIndex(t => t.id === playerState.currentTrack?.id) === 0}
            >
              <SkipBack
                size={20}
                color={
                  playerState.queue.findIndex(t => t.id === playerState.currentTrack?.id) === 0
                    ? colors.tabIconDefault
                    : colors.text
                }
              />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayPause}
            >
              {playerState.isPlaying && !playerState.isPaused ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={playNext}
              disabled={
                playerState.queue.findIndex(t => t.id === playerState.currentTrack?.id) ===
                playerState.queue.length - 1
              }
            >
              <SkipForward
                size={20}
                color={
                  playerState.queue.findIndex(t => t.id === playerState.currentTrack?.id) ===
                  playerState.queue.length - 1
                    ? colors.tabIconDefault
                    : colors.text
                }
              />
            </TouchableOpacity>

            {/* Expand/Collapse */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown size={20} color={colors.text} />
              ) : (
                <ChevronUp size={20} color={colors.text} />
              )}
            </TouchableOpacity>

            {/* Close button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={stop}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expanded Controls */}
        {isExpanded && (
          <Animated.View
            style={[
              styles.expandedControls,
              {
                opacity: expandAnim,
              },
            ]}
          >
            {/* Seek Controls */}
            <View style={styles.seekControls}>
              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => seekBy(-15)}
              >
                <RotateCcw size={16} color={colors.text} />
                <Text style={[styles.seekText, { color: colors.text }]}>15s</Text>
              </TouchableOpacity>

              {/* Speed Control */}
              <TouchableOpacity
                style={[styles.speedButton, { backgroundColor: colors.card }]}
                onPress={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                <Gauge size={16} color={colors.text} />
                <Text style={[styles.speedText, { color: colors.text }]}>
                  {playerState.playbackSpeed}×
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => seekBy(15)}
              >
                <RotateCw size={16} color={colors.text} />
                <Text style={[styles.seekText, { color: colors.text }]}>15s</Text>
              </TouchableOpacity>
            </View>

            {/* Position */}
            {playerState.duration > 0 && (
              <View style={styles.positionInfo}>
                <Text style={[styles.positionText, { color: colors.tabIconDefault }]}>
                  {formatTime(playerState.position)} / {formatTime(playerState.duration)}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Speed Menu */}
        {showSpeedMenu && (
          <View style={[styles.speedMenu, { backgroundColor: colors.card }]}>
            {speedOptions.map(speed => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedOption,
                  playerState.playbackSpeed === speed && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => handleSpeedChange(speed)}
              >
                <Text
                  style={[
                    styles.speedOptionText,
                    { color: playerState.playbackSpeed === speed ? colors.primary : colors.text },
                  ]}
                >
                  {speed}×
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedControls: {
    marginTop: 12,
  },
  seekControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  seekText: {
    fontSize: 12,
    fontWeight: '500',
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  positionInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  positionText: {
    fontSize: 11,
  },
  speedMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  speedOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  speedOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});