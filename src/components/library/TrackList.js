import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaEllipsisH } from 'react-icons/fa';
import { 
  setCurrentTrack, 
  setQueue, 
  togglePlayPause 
} from '../../store/playerSlice';
import { 
  toggleFavorite, 
  addToPlaylist, 
  removeFromPlaylist 
} from '../../store/librarySlice';
import AddToPlaylistButton from './AddToPlaylistButton';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
`;

const TableHead = styled.thead`
  border-bottom: 1px solid #282828;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 8px 16px;
  color: #b3b3b3;
  font-size: 14px;
  font-weight: normal;
`;

const TableRow = styled.tr`
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.isFavorite ? '#1db954' : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.isFavorite ? 1 : 0.7};
  
  &:hover {
    opacity: 1;
  }
`;

const OptionsButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  position: relative;
  
  &:hover {
    opacity: 1;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  width: 200px;
  background-color: #282828;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 10;
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: white;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #333;
  }
`;

const TrackList = ({ tracks, playlistId }) => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const { favoriteTrackIds, playlists } = useSelector((state) => state.library);
  const [openDropdown, setOpenDropdown] = React.useState(null);
  
  const handlePlayTrack = (track, index) => {
    if (currentTrack && currentTrack.id === track.id) {
      dispatch(togglePlayPause());
    } else {
      dispatch(setCurrentTrack(track));
      dispatch(setQueue(tracks));
    }
  };
  
  const handleToggleFavorite = (trackId) => {
    dispatch(toggleFavorite(trackId));
  };
  
  const handleAddToPlaylist = (track, playlistId) => {
    dispatch(addToPlaylist({ playlistId, track }));
    setOpenDropdown(null);
  };
  
  const handleRemoveFromPlaylist = (trackId) => {
    if (playlistId) {
      dispatch(removeFromPlaylist({ playlistId, trackId }));
    }
  };
  
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader style={{ width: '40px' }}>#</TableHeader>
          <TableHeader>Title</TableHeader>
          <TableHeader>Artist</TableHeader>
          <TableHeader>Album</TableHeader>
          <TableHeader style={{ width: '100px' }}>Duration</TableHeader>
          <TableHeader style={{ width: '120px' }}></TableHeader>
        </tr>
      </TableHead>
      <tbody>
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack && currentTrack.id === track.id;
          const isFavorite = favoriteTrackIds.includes(track.id);
          
          return (
            <TableRow key={track.id}>
              <TableCell>
                <PlayButton onClick={() => handlePlayTrack(track, index)}>
                  {isCurrentTrack && isPlaying ? <FaPause /> : <FaPlay />}
                </PlayButton>
              </TableCell>
              <TableCell>{track.name}</TableCell>
              <TableCell>{track.artist_name}</TableCell>
              <TableCell>{track.album_name || '-'}</TableCell>
              <TableCell>{formatDuration(track.duration || 0)}</TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <FavoriteButton
                    isFavorite={isFavorite}
                    onClick={() => handleToggleFavorite(track.id)}
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </FavoriteButton>
                  
                  {!playlistId && <AddToPlaylistButton track={track} />}
                  
                  <OptionsButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === track.id ? null : track.id);
                    }}
                  >
                    <FaEllipsisH />
                    {openDropdown === track.id && (
                      <DropdownMenu onClick={(e) => e.stopPropagation()}>
                        {playlistId ? (
                          <MenuItem onClick={() => handleRemoveFromPlaylist(track.id)}>
                            Remove from playlist
                          </MenuItem>
                        ) : (
                          <>
                            <MenuItem>Add to queue</MenuItem>
                            {playlists.length > 0 && (
                              <>
                                <MenuItem>Add to playlist</MenuItem>
                                {playlists.map(playlist => (
                                  <MenuItem 
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(track, playlist.id)}
                                    style={{ paddingLeft: '24px' }}
                                  >
                                    {playlist.name}
                                  </MenuItem>
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </DropdownMenu>
                    )}
                  </OptionsButton>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
};

export default TrackList;