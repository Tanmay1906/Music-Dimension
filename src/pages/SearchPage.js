import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { searchTracks } from '../store/librarySlice';
import TrackList from '../components/library/TrackList';
import TrackCard from '../components/library/TrackCard';

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

const SearchContainer = styled.div`
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
    pointer-events: none;
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

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 30px;
  padding: 10px 20px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    background-size: 200% 200%;
    animation: ${shimmer} 3s infinite;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 15px;
    margin-bottom: 20px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 50px;
  border: none;
  background-color: transparent;
  color: white;
  font-size: 16px;
  outline: none;
  width: 100%;
  position: relative;
  z-index: 11;
  
  &::placeholder {
    color: #b3b3b3;
  }
  
  &:focus {
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
  }
`;

const SearchIcon = styled.div`
  position: relative;
  right: 10px;
  color: #ffffff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;
  z-index: 11;
  pointer-events: none;
  
  @media (max-width: 768px) {
    font-size: 16px;
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

const NoResultsMessage = styled.div`
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

const SearchResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const { searchResults, loading, error } = useSelector((state) => state.library);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      dispatch(searchTracks(query));
    }
  };
  
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };
  
  return (
    <SearchContainer>
      <BackgroundGradient />
      
      <ContentContainer>
        <Header>
          <Title>Search</Title>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={query}
              onChange={handleInputChange}
            />
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
          </SearchForm>
        </Header>
        
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionTitle>Results for "{query}"</SectionTitle>
            
            {loading ? (
              <LoadingMessage>
                <p>Searching...</p>
              </LoadingMessage>
            ) : error ? (
              <ErrorMessage>
                <p>{error}</p>
              </ErrorMessage>
            ) : searchResults.length === 0 ? (
              <NoResultsMessage>
                <p>No results found for "{query}"</p>
              </NoResultsMessage>
            ) : (
              <>
                <SearchResultsGrid>
                  {searchResults.slice(0, 6).map(track => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </SearchResultsGrid>
                
                <SectionTitle style={{ marginTop: '40px' }}>All Results</SectionTitle>
                <TrackListContainer>
                  <TrackList tracks={searchResults} />
                </TrackListContainer>
              </>
            )}
          </motion.div>
        )}
      </ContentContainer>
    </SearchContainer>
  );
};

export default SearchPage;