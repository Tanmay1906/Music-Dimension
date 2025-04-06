import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Navigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaPlay, FaPause } from 'react-icons/fa';
import TrackList from '../components/library/TrackList';
import TrackCard from '../components/library/TrackCard';
import { setQueue, setCurrentTrack, togglePlayPause } from '../store/playerSlice';

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

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const ArtistContainer = styled.div`
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

const BackgroundGradient = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    z-index: 1;
    pointer-events: none;
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 1;
`;

const Header = styled(motion.div)`
  display: flex;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ArtistAvatar = styled(motion.div)`
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #ffffff;
  border-radius: 50%;
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
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const ArtistInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ArtistName = styled(motion.h1)`
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
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const ArtistBio = styled(motion.p)`
  font-size: 16px;
  color: #b3b3b3;
  margin-bottom: 24px;
  max-width: 600px;
  line-height: 1.6;
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

const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.3));
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
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

const TrackListContainer = styled(motion.div)`
  position: relative;
  z-index: 1;
  background: rgba(15, 15, 26, 0.5);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 15px;
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

const ArtistPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  
  // In a real app, we would fetch artist data from an API
  // For now, we'll use mock data
  const [artist, setArtist] = useState({
    id,
    name: 'Artist Name',
    bio: 'This is a sample artist bio. In a real application, this would be fetched from an API.',
    tracks: [
      { id: '1', title: 'Track 1', artist: 'Artist Name', album: 'Album 1', duration: 180, cover: null },
      { id: '2', title: 'Track 2', artist: 'Artist Name', album: 'Album 1', duration: 240, cover: null },
      { id: '3', title: 'Track 3', artist: 'Artist Name', album: 'Album 2', duration: 200, cover: null },
      { id: '4', title: 'Track 4', artist: 'Artist Name', album: 'Album 2', duration: 220, cover: null },
      { id: '5', title: 'Track 5', artist: 'Artist Name', album: 'Album 3', duration: 190, cover: null },
      { id: '6', title: 'Track 6', artist: 'Artist Name', album: 'Album 3', duration: 210, cover: null },
    ]
  });
  
  const handlePlay = () => {
    if (artist.tracks.length === 0) return;
    
    // If already playing this artist
    if (currentTrack && artist.tracks.some(track => track.id === currentTrack.id)) {
      dispatch(togglePlayPause());
    } else {
      // Start playing from the beginning
      dispatch(setQueue(artist.tracks));
      dispatch(setCurrentTrack(artist.tracks[0]));
    }
  };
  
  // Check if this artist is currently playing
  const isCurrentArtist = currentTrack && artist.tracks.some(track => track.id === currentTrack.id);
  
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
    <ArtistContainer>
      <BackgroundGradient />
      
      <ContentContainer>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Header>
            <ArtistAvatar
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaUser />
            </ArtistAvatar>
            <ArtistInfo>
              <ArtistName variants={itemVariants}>{artist.name}</ArtistName>
              <ArtistBio variants={itemVariants}>{artist.bio}</ArtistBio>
              <PlayButton 
                onClick={handlePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                {isCurrentArtist && isPlaying ? <FaPause /> : <FaPlay />}
              </PlayButton>
            </ArtistInfo>
          </Header>
          
          {artist.tracks.length === 0 ? (
            <EmptyState variants={itemVariants}>
              <p>No tracks available for this artist.</p>
            </EmptyState>
          ) : (
            <>
              <SectionTitle>Popular Tracks</SectionTitle>
              <TracksGrid variants={itemVariants}>
                {artist.tracks.slice(0, 6).map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </TracksGrid>
              
              <SectionTitle>All Tracks</SectionTitle>
              <TrackListContainer variants={itemVariants}>
                <TrackList tracks={artist.tracks} />
              </TrackListContainer>
            </>
          )}
        </motion.div>
      </ContentContainer>
    </ArtistContainer>
  );
};

export default ArtistPage; 