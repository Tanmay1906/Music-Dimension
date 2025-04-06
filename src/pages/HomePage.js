import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { fetchPopularTracks } from '../store/librarySlice';
import TrackList from '../components/library/TrackList';
import TrackCard from '../components/library/TrackCard';
import { FaHeadphones, FaSearch, FaUser, FaHeart, FaPlay } from 'react-icons/fa';
import { setCurrentTrack, setQueue, togglePlayPause } from '../store/playerSlice';
import AddToPlaylistButton from '../components/library/AddToPlaylistButton';

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

// Styled Components
const HomeContainer = styled.div`
  color: white;
  position: relative;
  overflow: hidden;
  background: #000000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
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
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin-bottom: 15px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
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
    font-size: 28px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const SubTitle = styled.p`
  font-size: 16px;
  color: #b3b3b3;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 30px;
  padding: 10px 20px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  
  svg {
    color: #ffffff;
    margin-right: 10px;
    font-size: 18px;
  }
  
  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 16px;
    width: 100%;
    outline: none;
    
    &::placeholder {
      color: #b3b3b3;
    }
  }
  
  @media (max-width: 768px) {
    padding: 8px 15px;
    margin-bottom: 20px;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ffffff;
    border-radius: 5px;
  }
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const CategoryTab = styled.div`
  padding: 8px 16px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.5)'};
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const FeaturedSection = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const FeaturedCard = styled.div`
  background: linear-gradient(135deg, rgba(15, 15, 26, 0.7) 0%, rgba(26, 26, 46, 0.5) 100%);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const FeaturedImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  }
  
  @media (min-width: 768px) {
    width: 200px;
    height: auto;
  }
  
  @media (max-width: 480px) {
    height: 150px;
  }
`;

const FeaturedInfo = styled.div`
  padding: 20px;
  flex: 1;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const FeaturedTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 10px;
  color: #ffffff;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
`;

const FeaturedSubtitle = styled.p`
  font-size: 14px;
  color: #b3b3b3;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 15px;
  }
`;

const PlayButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 12px;
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #b3b3b3;
  position: relative;
  z-index: 1;
  
  p {
    margin: 10px 0;
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 30px;
    
    p {
      font-size: 14px;
    }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ff6b6b;
  position: relative;
  z-index: 1;
  
  p {
    margin: 10px 0;
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 30px;
    
    p {
      font-size: 14px;
    }
  }
`;

const TrackListContainer = styled.div`
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
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const FeaturedTracksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HomePage = () => {
  const dispatch = useDispatch();
  const { popularTracks, loading, error } = useSelector((state) => state.library);
  const { isPlaying } = useSelector((state) => state.player);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    'All', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B'
  ];
  
  useEffect(() => {
    dispatch(fetchPopularTracks());
  }, [dispatch]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  const handlePlayFeatured = () => {
    if (popularTracks && popularTracks.length > 0) {
      dispatch(setCurrentTrack(popularTracks[0]));
      dispatch(setQueue(popularTracks));
      dispatch(togglePlayPause());
    }
  };
  
  const filteredTracks = popularTracks ? popularTracks.filter(track => {
    if (activeCategory !== 'All' && track.genre !== activeCategory) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        track.name.toLowerCase().includes(query) ||
        track.artist_name.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) : [];
  
  return (
    <HomeContainer>
      <BackgroundGradient />
      
      <ContentContainer>
        <Header>
          <HeaderIcon>
            <FaHeadphones />
          </HeaderIcon>
          <Title>Welcome to Music Dimension</Title>
          <SubTitle>Discover new music and enjoy unlimited streaming</SubTitle>
        </Header>
        
        <SearchBar>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search for songs, artists, or albums..." 
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchBar>
        
        <CategoryTabs>
          {categories.map(category => (
            <CategoryTab 
              key={category}
              active={activeCategory === category}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </CategoryTab>
          ))}
        </CategoryTabs>
        
        <FeaturedSection>
          <SectionTitle>Featured Playlist</SectionTitle>
          <FeaturedCard>
            <FeaturedImage />
            <FeaturedInfo>
              <FeaturedTitle>Neon Nights</FeaturedTitle>
              <FeaturedSubtitle>A collection of the hottest tracks for your late-night vibes</FeaturedSubtitle>
              <PlayButton onClick={handlePlayFeatured}>
                <FaPlay /> Play Now
              </PlayButton>
            </FeaturedInfo>
          </FeaturedCard>
        </FeaturedSection>
        
        <SectionTitle>Featured Tracks</SectionTitle>
        {loading ? (
          <LoadingMessage>
            <p>Loading tracks...</p>
          </LoadingMessage>
        ) : error ? (
          <ErrorMessage>
            <p>{error}</p>
          </ErrorMessage>
        ) : (
          <FeaturedTracksGrid>
            {filteredTracks.slice(0, 6).map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </FeaturedTracksGrid>
        )}
        
        <SectionTitle>Popular Tracks</SectionTitle>
        
        {loading ? (
          <LoadingMessage>
            <p>Loading tracks...</p>
          </LoadingMessage>
        ) : error ? (
          <ErrorMessage>
            <p>{error}</p>
          </ErrorMessage>
        ) : (
          <TrackListContainer>
            <TrackList tracks={filteredTracks} />
          </TrackListContainer>
        )}
      </ContentContainer>
    </HomeContainer>
  );
};

export default HomePage;