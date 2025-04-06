import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { addToPlaylist } from '../../store/librarySlice';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const MenuContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(15, 15, 26, 0.95);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
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

const MenuItem = styled.div`
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

const PlaylistMenu = ({ track, onClose }) => {
  const dispatch = useDispatch();
  const { playlists } = useSelector((state) => state.library);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleSelectPlaylist = (playlistId) => {
    dispatch(addToPlaylist({ playlistId, track }));
    onClose();
  };
  
  return (
    <MenuContainer ref={menuRef}>
      {playlists.map(playlist => (
        <MenuItem 
          key={playlist.id} 
          onClick={() => handleSelectPlaylist(playlist.id)}
        >
          <PlaylistName>{playlist.name}</PlaylistName>
          <PlaylistTrackCount>{playlist.tracks ? playlist.tracks.length : 0} tracks</PlaylistTrackCount>
        </MenuItem>
      ))}
    </MenuContainer>
  );
};

export default PlaylistMenu; 