import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaMusic, FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import TrackList from '../components/library/TrackList';
import TrackCard from '../components/library/TrackCard';
import { setQueue, setCurrentTrack, togglePlayPause } from '../store/playerSlice';
import { deletePlaylist } from '../store/librarySlice';
import { motion, AnimatePresence } from 'framer-motion';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
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

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const PlaylistContainer = styled.div`
  color: white;
  position: relative;
  overflow: hidden;
  padding: 20px;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  min-height: 100vh;
  
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

const BackgroundEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  opacity: 0.15;
`;

const Particle = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  filter: blur(1px);
  animation: ${pulse} ${props => props.duration}s infinite;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
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

const Header = styled(motion.div)`
  display: flex;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
`;

const PlaylistCover = styled(motion.div)`
  width: 232px;
  height: 232px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    background-size: 200% 200%;
    animation: ${shimmer} 3s infinite;
  }
  
  svg {
    animation: ${rotate} 20s linear infinite;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
`;

const PlaylistInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const PlaylistType = styled(motion.p)`
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const Title = styled(motion.h1)`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.3));
    border-radius: 2px;
    animation: ${glow} 2s infinite;
  }
`;

const PlaylistDetails = styled(motion.p)`
  font-size: 14px;
  color: #b3b3b3;
  margin-bottom: 24px;
`;

const PlayButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  svg {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
  }
`;

const DeleteButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 16px;
  
  &:hover {
    background: rgba(255, 59, 48, 0.2);
    transform: scale(1.05);
  }
  
  svg {
    filter: drop-shadow(0 0 5px rgba(255, 59, 48, 0.5));
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 40px;
  color: #b3b3b3;
  position: relative;
  z-index: 1;
  
  p {
    margin: 10px 0;
    font-size: 16px;
  }
`;

const TrackListContainer = styled(motion.div)`
  position: relative;
  z-index: 1;
`;

const TracksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const playlists = useSelector((state) => state.library.playlists);
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const [particles, setParticles] = useState([]);
  const [visualizerBars, setVisualizerBars] = useState([]);
  const [isMounted, setIsMounted] = useState(true);
  
  const playlist = playlists.find(p => p.id === id);
  
  // Generate particles for background effect
  useEffect(() => {
    if (!isMounted) return;
    
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 10 + 5,
      color: i % 2 ? '#ffffff' : '#b3b3b3',
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 2
    }));
    setParticles(newParticles);
  }, [isMounted]);
  
  // Generate visualizer bars
  useEffect(() => {
    if (!isMounted) return;
    
    const bars = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: (i / 15) * 100,
      height: Math.random() * 30 + 10,
      duration: Math.random() * 1 + 0.5
    }));
    
    setVisualizerBars(bars);
    
    // Update visualizer bars periodically
    const interval = setInterval(() => {
      if (!isMounted) return;
      
      setVisualizerBars(prevBars => 
        prevBars.map(bar => ({
          ...bar,
          height: Math.random() * 30 + 10,
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
  
  if (!playlist) {
    return <Navigate to="/library" replace />;
  }
  
  const handlePlay = () => {
    if (playlist.tracks.length === 0) return;
    
    // If already playing this playlist
    if (currentTrack && playlist.tracks.some(track => track.id === currentTrack.id)) {
      dispatch(togglePlayPause());
    } else {
      // Start playing from the beginning
      dispatch(setQueue(playlist.tracks));
      dispatch(setCurrentTrack(playlist.tracks[0]));
    }
  };
  
  // Check if this playlist is currently playing
  const isCurrentPlaylist = currentTrack && playlist.tracks.some(track => track.id === currentTrack.id);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      dispatch(deletePlaylist(id));
      navigate('/library');
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <PlaylistContainer>
      <BackgroundEffect>
        {particles.map(particle => (
          <Particle 
            key={particle.id}
            size={particle.size}
            color={particle.color}
            top={particle.top}
            left={particle.left}
            duration={particle.duration}
          />
        ))}
        
        {visualizerBars.map(bar => (
          <VisualizerBar 
            key={bar.id}
            left={bar.left}
            height={bar.height}
            duration={bar.duration}
          />
        ))}
      </BackgroundEffect>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Header>
          <PlaylistCover
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaMusic />
          </PlaylistCover>
          <PlaylistInfo>
            <PlaylistType variants={itemVariants}>Playlist</PlaylistType>
            <Title variants={itemVariants}>{playlist.name}</Title>
            <PlaylistDetails variants={itemVariants}>
              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
            </PlaylistDetails>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PlayButton 
                onClick={handlePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                {isCurrentPlaylist && isPlaying ? <FaPause /> : <FaPlay />}
              </PlayButton>
              <DeleteButton
                onClick={handleDelete}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <FaTrash />
              </DeleteButton>
            </div>
          </PlaylistInfo>
        </Header>
        
        {playlist.tracks.length === 0 ? (
          <EmptyState variants={itemVariants}>
            <p>This playlist is empty.</p>
            <p>Search for tracks and add them to this playlist.</p>
          </EmptyState>
        ) : (
          <>
            <TracksGrid variants={itemVariants}>
              {playlist.tracks.slice(0, 6).map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </TracksGrid>
            
            <TrackListContainer variants={itemVariants}>
              <TrackList tracks={playlist.tracks} playlistId={playlist.id} />
            </TrackListContainer>
          </>
        )}
      </motion.div>
    </PlaylistContainer>
  );
};

export default PlaylistPage;