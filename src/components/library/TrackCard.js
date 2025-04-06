import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import { setCurrentTrack, setQueue, togglePlayPause } from '../../store/playerSlice';
import { toggleFavorite } from '../../store/librarySlice';
import AddToPlaylistButton from './AddToPlaylistButton';

const Card = styled.div`
  background: rgba(15, 15, 26, 0.5);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(15, 15, 26, 0.7);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const TrackImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  svg {
    font-size: 24px;
    color: #ffffff;
  }
`;

const TrackInfo = styled.div`
  flex: 1;
`;

const TrackName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
`;

const TrackArtist = styled.div`
  font-size: 14px;
  color: #b3b3b3;
`;

const TrackActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.isFavorite ? '#ff4081' : '#b3b3b3'};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TrackCard = ({ track }) => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const { favoriteTrackIds } = useSelector((state) => state.library);
  
  const isCurrentTrack = currentTrack && currentTrack.id === track.id;
  const isFavorite = favoriteTrackIds.includes(track.id);
  
  const handlePlayTrack = () => {
    if (isCurrentTrack) {
      dispatch(togglePlayPause());
    } else {
      dispatch(setCurrentTrack(track));
      dispatch(setQueue([track]));
      dispatch(togglePlayPause());
    }
  };
  
  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(track.id));
  };
  
  return (
    <Card>
      <TrackImage>
        {track.image ? (
          <img src={track.image} alt={track.name} />
        ) : (
          <FaPlay />
        )}
      </TrackImage>
      <TrackInfo>
        <TrackName>{track.name}</TrackName>
        <TrackArtist>{track.artist_name}</TrackArtist>
      </TrackInfo>
      <TrackActions>
        <PlayButton onClick={handlePlayTrack}>
          {isCurrentTrack && isPlaying ? <FaPause /> : <FaPlay />}
        </PlayButton>
        <FavoriteButton 
          isFavorite={isFavorite}
          onClick={handleToggleFavorite}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>
        <AddToPlaylistButton track={track} />
      </TrackActions>
    </Card>
  );
};

export default TrackCard; 