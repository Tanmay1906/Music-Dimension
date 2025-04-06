import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaForward, 
  FaBackward, 
  FaVolumeUp, 
  FaVolumeMute,
  FaRandom,
  FaRedo,
  FaHeart,
  FaRegHeart,
  FaExpand,
  FaCompress,
  FaListUl,
  FaDownload,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { toggleFavorite, addToPlaylist } from '../store/librarySlice';
import { 
  togglePlayPause, 
  nextTrack, 
  prevTrack, 
  setVolume, 
  toggleRepeatMode, 
  toggleShuffleMode,
  updateTrackPosition
} from '../store/playerSlice';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #0f0f1a, #1a1a2e);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.5);
  }
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  width: 30%;
  min-width: 200px;
`;

const AlbumArt = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }
  
  ${props => props.isPlaying && `
    animation: ${pulse} 2s infinite ease-in-out;
  `}
`;

const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TrackName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: white;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const ArtistName = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  max-width: 500px;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
  
  &:hover {
    height: 6px;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 10px;
      transform: translateY(-50%);
      background: transparent;
      z-index: 1;
    }
  }
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #7b68ee);
  border-radius: 2px;
  position: relative;
  transition: width 0.1s linear;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    transform: translate(50%, -50%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  ${ProgressContainer}:hover &::after {
    opacity: 1;
  }
`;

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  font-size: ${props => props.size || '16px'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  ${props => props.active && `
    color: white;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  `}
`;

const PlayPauseButton = styled(ControlButton)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isPlaying ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: ${props => props.isPlaying ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.05);
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  width: 20%;
  min-width: 150px;
  justify-content: flex-end;
`;

const VolumeSlider = styled.div`
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-left: 10px;
  cursor: pointer;
  position: relative;
  
  &:hover {
    height: 6px;
  }
`;

const VolumeLevel = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #7b68ee);
  border-radius: 2px;
  position: relative;
  transition: width 0.1s linear;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    transform: translate(50%, -50%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  ${VolumeSlider}:hover &::after {
    opacity: 1;
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(15, 15, 26, 0.95);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 150px;
  z-index: 1001;
  animation: ${fadeIn} 0.2s ease;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    font-size: 16px;
  }
`;

const PlaylistMenu = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(15, 15, 26, 0.95);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1001;
  animation: ${fadeIn} 0.2s ease;
`;

const PlaylistItem = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PlaylistName = styled.div`
  font-size: 14px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaylistTrackCount = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const Player = () => {
  const dispatch = useDispatch();
  const { 
    currentTrack, 
    isPlaying, 
    volume: savedVolume, 
    repeatMode: savedRepeatMode, 
    shuffleMode: savedShuffleMode,
    trackStates
  } = useSelector((state) => state.player);
  
  const { 
    favoriteTrackIds, 
    playlists 
  } = useSelector((state) => state.library);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(savedVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(savedShuffleMode);
  const [repeatMode, setRepeatMode] = useState(savedRepeatMode);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const actionMenuRef = useRef(null);
  const playlistMenuRef = useRef(null);

  // Format time in MM:SS
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    dispatch(togglePlayPause());
  }, [dispatch]);

  // Handle track ended
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all' || isShuffle) {
      dispatch(nextTrack());
    }
  }, [repeatMode, isShuffle, dispatch]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      
      // Update track position in Redux store every 5 seconds
      if (currentTrack && currentTrack.id && Math.floor(newTime) % 5 === 0) {
        dispatch(updateTrackPosition({ trackId: currentTrack.id, position: newTime }));
      }
    }
  }, [currentTrack, dispatch]);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      
      // Restore saved position if available
      if (currentTrack && currentTrack.id && trackStates[currentTrack.id]) {
        const savedPosition = trackStates[currentTrack.id].lastPosition;
        if (savedPosition > 0 && savedPosition < audioRef.current.duration) {
          audioRef.current.currentTime = savedPosition;
          setCurrentTime(savedPosition);
        }
      }
    }
  }, [currentTrack, trackStates]);

  // Handle progress bar click
  const handleProgressClick = useCallback((e) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    if (volumeRef.current && audioRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newVolume = Math.max(0, Math.min(1, percent));
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
      dispatch(setVolume(newVolume));
    }
  }, [dispatch]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffle(!isShuffle);
    dispatch(toggleShuffleMode());
  }, [isShuffle, dispatch]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    if (repeatMode === 'none') {
      setRepeatMode('all');
    } else if (repeatMode === 'all') {
      setRepeatMode('one');
    } else {
      setRepeatMode('none');
    }
    dispatch(toggleRepeatMode());
  }, [repeatMode, dispatch]);

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Toggle playlist visibility
  const togglePlaylist = useCallback(() => {
    setShowPlaylist(!showPlaylist);
    setShowPlaylistMenu(!showPlaylistMenu);
  }, [showPlaylist, showPlaylistMenu]);

  // Toggle action menu
  const toggleActionMenu = useCallback(() => {
    setShowActionMenu(!showActionMenu);
    if (!showActionMenu) {
      setShowPlaylistMenu(false);
    }
  }, [showActionMenu]);

  // Toggle favorite
  const toggleFavoriteTrack = useCallback(() => {
    if (currentTrack) {
      dispatch(toggleFavorite(currentTrack.id));
    }
  }, [currentTrack, dispatch]);

  // Skip to next/previous track
  const skipTrack = useCallback((direction) => {
    if (direction === 'next') {
      dispatch(nextTrack());
    } else if (direction === 'prev') {
      dispatch(prevTrack());
    }
  }, [dispatch]);

  // Add track to playlist
  const addTrackToPlaylist = useCallback((playlistId) => {
    if (currentTrack) {
      dispatch(addToPlaylist({ playlistId, track: currentTrack }));
      setShowPlaylistMenu(false);
    }
  }, [currentTrack, dispatch]);

  // Download track
  const downloadTrack = useCallback(() => {
    if (currentTrack && currentTrack.audio) {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = currentTrack.audio;
      link.download = `${currentTrack.name} - ${currentTrack.artist_name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowActionMenu(false);
  }, [currentTrack]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target)) {
        setShowPlaylistMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  // Update audio element when play state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync local state with Redux state
  useEffect(() => {
    setVolume(savedVolume);
    setIsShuffle(savedShuffleMode);
    setRepeatMode(savedRepeatMode);
  }, [savedVolume, savedShuffleMode, savedRepeatMode]);

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  // Check if current track is favorited
  const isFavorited = currentTrack && favoriteTrackIds.includes(currentTrack.id);

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.audio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />
      
      <PlayerContainer>
        <TrackInfo>
          {currentTrack && (
            <>
              <AlbumArt isPlaying={isPlaying}>
                <img src={currentTrack.image || '/default-album-art.jpg'} alt={currentTrack.name} />
              </AlbumArt>
              <TrackDetails>
                <TrackName>{currentTrack.name}</TrackName>
                <ArtistName>{currentTrack.artist_name}</ArtistName>
              </TrackDetails>
              <ControlButton 
                onClick={toggleFavoriteTrack}
                active={isFavorited}
                style={{ marginLeft: '15px' }}
              >
                {isFavorited ? <FaHeart /> : <FaRegHeart />}
              </ControlButton>
              <ControlButton 
                onClick={toggleActionMenu}
                style={{ marginLeft: '5px' }}
              >
                <FaPlus />
              </ControlButton>
              
              {showActionMenu && (
                <ActionMenu ref={actionMenuRef}>
                  <ActionButton onClick={downloadTrack}>
                    <FaDownload /> Download
                  </ActionButton>
                  <ActionButton onClick={togglePlaylist}>
                    <FaListUl /> Add to Playlist
                  </ActionButton>
                </ActionMenu>
              )}
              
              {showPlaylistMenu && (
                <PlaylistMenu ref={playlistMenuRef}>
                  {playlists.map(playlist => (
                    <PlaylistItem 
                      key={playlist.id} 
                      onClick={() => addTrackToPlaylist(playlist.id)}
                    >
                      <PlaylistName>{playlist.name}</PlaylistName>
                      <PlaylistTrackCount>{playlist.tracks.length} tracks</PlaylistTrackCount>
                    </PlaylistItem>
                  ))}
                </PlaylistMenu>
              )}
            </>
          )}
        </TrackInfo>
        
        <Controls>
          <ProgressContainer ref={progressRef} onClick={handleProgressClick}>
            <ProgressBar style={{ width: `${progressPercent}%` }} />
          </ProgressContainer>
          
          <TimeInfo>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </TimeInfo>
          
          <ControlButtons>
            <ControlButton onClick={toggleShuffle} active={isShuffle}>
              <FaRandom />
            </ControlButton>
            <ControlButton onClick={() => skipTrack('prev')}>
              <FaBackward />
            </ControlButton>
            <PlayPauseButton onClick={togglePlay} isPlaying={isPlaying}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </PlayPauseButton>
            <ControlButton onClick={() => skipTrack('next')}>
              <FaForward />
            </ControlButton>
            <ControlButton 
              onClick={toggleRepeat} 
              active={repeatMode !== 'none'}
            >
              <FaRedo style={{ 
                transform: repeatMode === 'one' ? 'scale(1.2)' : 'scale(1)',
                color: repeatMode === 'one' ? 'white' : 'inherit'
              }} />
            </ControlButton>
          </ControlButtons>
        </Controls>
        
        <VolumeContainer>
          <ControlButton onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </ControlButton>
          <VolumeSlider ref={volumeRef} onClick={handleVolumeChange}>
            <VolumeLevel style={{ width: `${volumePercent}%` }} />
          </VolumeSlider>
          <ControlButton onClick={togglePlaylist}>
            <FaListUl />
          </ControlButton>
          <ControlButton onClick={toggleExpanded}>
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </ControlButton>
        </VolumeContainer>
      </PlayerContainer>
    </>
  );
};

// Memoize the Player component to prevent unnecessary re-renders
export default memo(Player); 