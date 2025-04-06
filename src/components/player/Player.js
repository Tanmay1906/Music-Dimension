import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaRandom,
  FaRedo
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import {
  togglePlayPause,
  nextTrack,
  prevTrack,
  setVolume,
  toggleRepeatMode,
  toggleShuffleMode
} from '../../store/playerSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
`;

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  height: 90px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  width: 30%;
  position: relative;
  z-index: 2;
`;

const TrackCover = styled.img`
  width: 56px;
  height: 56px;
  object-fit: cover;
  margin-right: 14px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }
`;

const TrackMetaData = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackName = styled.div`
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ArtistName = styled.div`
  color: #b3b3b3;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  position: relative;
  z-index: 2;
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? '#ffffff' : '#b3b3b3'};
  font-size: ${props => props.primary ? '32px' : '16px'};
  margin: 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffffff;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  ${props => props.primary && `
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
  `}
`;

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
`;

const TimeInfo = styled.span`
  color: #b3b3b3;
  font-size: 11px;
  min-width: 40px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ProgressBar = styled.input`
  flex: 1;
  margin: 0 8px;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  background-image: ${props => `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)) 0 0 / ${props.value}% 100% no-repeat`};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: ${glow} 2s infinite;
  }
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    opacity: 0;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  &:hover::-webkit-slider-thumb {
    opacity: 1;
    transform: scale(1.2);
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  width: 30%;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
`;

const VolumeSlider = styled.input`
  width: 100px;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  background-image: ${props => `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)) 0 0 / ${props.value * 100}% 100% no-repeat`};
  margin-left: 8px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: ${glow} 2s infinite;
  }
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    opacity: 0;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  &:hover::-webkit-slider-thumb {
    opacity: 1;
    transform: scale(1.2);
  }
`;

const VisualizerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  opacity: 0.3;
`;

const VisualizerBar = styled.div`
  position: absolute;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
  border-radius: 3px 3px 0 0;
  transform-origin: bottom center;
  animation: ${float} ${props => props.duration}s infinite;
  left: ${props => props.left}%;
  height: ${props => props.height}%;
`;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const Player = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume, repeatMode, shuffleMode } = useSelector((state) => state.player);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState([]);
  const [isMounted, setIsMounted] = useState(true);
  
  // Generate visualizer bars
  useEffect(() => {
    if (!isMounted) return;
    
    const bars = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: (i / 30) * 100,
      height: Math.random() * 50 + 10,
      duration: Math.random() * 1 + 0.5
    }));
    
    setVisualizerBars(bars);
    
    // Update visualizer bars periodically
    const interval = setInterval(() => {
      if (!isMounted) return;
      
      setVisualizerBars(prevBars => 
        prevBars.map(bar => ({
          ...bar,
          height: Math.random() * 50 + 10,
          duration: Math.random() * 1 + 0.5
        }))
      );
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [isMounted]);
  
  // Handle component mount/unmount
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Handle audio playback
  useEffect(() => {
    if (!isMounted) return;
    
    if (currentTrack && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  }, [currentTrack, isMounted]);
  
  // Handle play/pause
  useEffect(() => {
    if (!isMounted) return;
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMounted]);
  
  // Handle volume changes
  useEffect(() => {
    if (!isMounted) return;
    
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, isMounted]);
  
  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && isMounted) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [isMounted]);
  
  // Handle metadata loading
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && isMounted) {
      setDuration(audioRef.current.duration);
    }
  }, [isMounted]);
  
  // Handle progress changes
  const handleProgressChange = useCallback((e) => {
    if (!isMounted) return;
    
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, [isMounted]);
  
  // Handle volume changes
  const handleVolumeChange = useCallback((e) => {
    if (!isMounted) return;
    
    const value = parseFloat(e.target.value);
    dispatch(setVolume(value));
  }, [dispatch, isMounted]);
  
  // Handle track ending
  const handleEnded = useCallback(() => {
    if (!isMounted) return;
    
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      }
    } else {
      dispatch(nextTrack());
    }
  }, [repeatMode, dispatch, isMounted]);
  
  return (
    <PlayerContainer>
      <VisualizerContainer>
        {visualizerBars.map(bar => (
          <VisualizerBar 
            key={bar.id}
            left={bar.left}
            height={bar.height}
            duration={bar.duration}
          />
        ))}
      </VisualizerContainer>
      
      <audio
        ref={audioRef}
        src={currentTrack?.audio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <TrackInfo>
        {currentTrack && (
          <>
            <TrackCover src={currentTrack.image || '/placeholder.png'} alt={currentTrack.name} />
            <TrackMetaData>
              <TrackName>{currentTrack.name}</TrackName>
              <ArtistName>{currentTrack.artist_name}</ArtistName>
            </TrackMetaData>
          </>
        )}
      </TrackInfo>
      
      <Controls>
        <ControlButtons>
          <Button 
            active={shuffleMode} 
            onClick={() => dispatch(toggleShuffleMode())}
          >
            <FaRandom />
          </Button>
          
          <Button onClick={() => dispatch(prevTrack())}>
            <FaStepBackward />
          </Button>
          
          <Button primary onClick={() => dispatch(togglePlayPause())}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          
          <Button onClick={() => dispatch(nextTrack())}>
            <FaStepForward />
          </Button>
          
          <Button 
            active={repeatMode !== 'none'} 
            onClick={() => dispatch(toggleRepeatMode())}
          >
            <FaRedo />
            {repeatMode === 'one' && <span style={{ fontSize: '8px', position: 'absolute' }}>1</span>}
          </Button>
        </ControlButtons>
        
        <ProgressContainer>
          <TimeInfo>{formatTime(currentTime)}</TimeInfo>
          <ProgressBar
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
          />
          <TimeInfo>{formatTime(duration)}</TimeInfo>
        </ProgressContainer>
      </Controls>
      
      <VolumeContainer>
        <Button onClick={() => dispatch(setVolume(volume > 0 ? 0 : 0.7))}>
          {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
        </Button>
        <VolumeSlider
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
        />
      </VolumeContainer>
    </PlayerContainer>
  );
};

export default Player;