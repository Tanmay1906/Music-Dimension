import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaPlus, FaUpload, FaTimes, FaCheck, FaImage, FaPlay, FaPause, FaHeart, FaTrash, FaListUl } from 'react-icons/fa';
import { createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, deleteUploadedTrack, toggleFavorite } from '../store/librarySlice';

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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const CoverUpload = styled.div`
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const LibraryContainer = styled.div`
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
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
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  svg {
    margin-right: 8px;
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  margin-top: 32px;
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

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-gap: 24px;
  
  @media (max-width: 768px) {
    grid-gap: 16px;
  }
`;

const PlaylistCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(15, 15, 26, 0.7) 0%, rgba(26, 26, 46, 0.5) 100%);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  text-decoration: none;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.7) 0%, rgba(15, 15, 26, 0.5) 100%);
    transform: translateY(-4px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const PlaylistCover = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #ffffff;
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
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  svg {
    animation: ${pulse} 2s infinite;
  }
`;

const PlaylistInfo = styled.div`
  padding: 16px;
`;

const PlaylistName = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: #ffffff;
`;

const PlaylistDetails = styled.p`
  font-size: 14px;
  color: #b3b3b3;
`;

const EmptyState = styled.div`
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

// Modal styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  border-radius: 10px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  color: #ffffff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ffffff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #b3b3b3;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const FileUpload = styled.div`
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const FilePreview = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  span {
    font-size: 14px;
    color: #b3b3b3;
  }
`;

const SubmitButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TrackImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 16px;
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

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
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
    background: rgba(255, 107, 107, 0.1);
  }
`;

const AddToPlaylistButton = styled.button`
  background: none;
  border: none;
  color: #b3b3b3;
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

const PlaylistMenu = styled.div`
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

const PlaylistItem = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PlaylistTrackCount = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const AudioPlayer = styled.audio`
  display: none;
`;

const CoverPreview = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
`;

const CoverPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  
  svg {
    font-size: 32px;
  }
  
  span {
    font-size: 14px;
  }
`;

const FilePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  
  svg {
    font-size: 32px;
  }
  
  span {
    font-size: 14px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
`;

const LibraryPage = () => {
  const dispatch = useDispatch();
  const { playlists, favoriteTrackIds } = useSelector((state) => state.library);
  
  // State for modals
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // State for playlist creation
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistCover, setPlaylistCover] = useState(null);
  const playlistCoverRef = useRef(null);
  
  // State for track upload
  const [trackName, setTrackName] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackFile, setTrackFile] = useState(null);
  const [trackCover, setTrackCover] = useState(null);
  const trackCoverRef = useRef(null);
  const trackFileRef = useRef(null);
  
  // State for audio playback
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const audioRef = useRef(null);
  
  // State for playlist menu
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const playlistMenuRef = useRef(null);
  
  // Load favorite tracks from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteTracks');
    if (savedFavorites) {
      setFavoriteTracks(JSON.parse(savedFavorites));
    }
  }, []);
  
  // Save favorite tracks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteTracks', JSON.stringify(favoriteTracks));
  }, [favoriteTracks]);
  
  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);
  
  // Close playlist menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target)) {
        setShowPlaylistMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get all uploaded tracks from playlists
  const getAllUploadedTracks = () => {
    const tracks = [];
    playlists.forEach(playlist => {
      if (playlist.tracks && playlist.tracks.length > 0) {
        playlist.tracks.forEach(track => {
          // Only include tracks that have an audio property (uploaded tracks)
          if (track.audio) {
            tracks.push({
              ...track,
              playlistId: playlist.id,
              playlistName: playlist.name
            });
          }
        });
      }
    });
    return tracks;
  };
  
  const uploadedTracks = getAllUploadedTracks();
  
  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (playlistName.trim()) {
      dispatch(createPlaylist({ 
        name: playlistName,
        description: playlistDescription,
        cover: playlistCover
      }));
      setPlaylistName('');
      setPlaylistDescription('');
      setPlaylistCover(null);
      setShowCreatePlaylistModal(false);
    }
  };
  
  const handleUploadTrack = (e) => {
    e.preventDefault();
    if (trackName.trim() && trackArtist.trim() && trackFile) {
      // Create a new track object
      const newTrack = {
        id: Date.now().toString(),
        name: trackName,
        artist_name: trackArtist,
        genre: trackGenre,
        audio: URL.createObjectURL(trackFile),
        image: trackCover ? URL.createObjectURL(trackCover) : null,
        duration: 0, // This would normally be calculated from the audio file
        is_favorite: false
      };
      
      // Find the "My Uploads" playlist or create it
      const uploadsPlaylist = playlists.find(p => p.name === "My Uploads");
      
      if (uploadsPlaylist) {
        // Add the track to the existing "My Uploads" playlist
        dispatch(createPlaylist({
          id: uploadsPlaylist.id,
          name: "My Uploads",
          tracks: [...uploadsPlaylist.tracks, newTrack],
          cover: uploadsPlaylist.cover || (trackCover ? URL.createObjectURL(trackCover) : null)
        }));
      } else {
        // Create a new "My Uploads" playlist with this track
        dispatch(createPlaylist({
          name: "My Uploads",
          tracks: [newTrack],
          cover: trackCover ? URL.createObjectURL(trackCover) : null
        }));
      }
      
      // Reset form
      setTrackName('');
      setTrackArtist('');
      setTrackGenre('');
      setTrackFile(null);
      setTrackCover(null);
      setShowUploadModal(false);
    }
  };
  
  const handlePlaylistCoverClick = () => {
    playlistCoverRef.current.click();
  };
  
  const handleTrackCoverClick = () => {
    trackCoverRef.current.click();
  };
  
  const handleTrackFileClick = () => {
    trackFileRef.current.click();
  };
  
  const handlePlaylistCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPlaylistCover(e.target.files[0]);
    }
  };
  
  const handleTrackCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTrackCover(e.target.files[0]);
    }
  };
  
  const handleTrackFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTrackFile(e.target.files[0]);
    }
  };
  
  const handlePlayTrack = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      // Toggle play/pause for the current track
      setIsPlaying(!isPlaying);
    } else {
      // Play the new track
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };
  
  const handleToggleFavorite = (trackId) => {
    dispatch(toggleFavorite(trackId));
    setFavoriteTracks(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };
  
  const isTrackFavorite = (trackId) => {
    return favoriteTracks.includes(trackId) || favoriteTrackIds.includes(trackId);
  };
  
  const handleDeleteTrack = (track) => {
    if (window.confirm(`Are you sure you want to delete "${track.name}"?`)) {
      dispatch(deleteUploadedTrack(track.id));
    }
  };
  
  const handleAddToPlaylist = (track) => {
    setSelectedTrack(track);
    setShowPlaylistMenu(true);
  };
  
  const handleSelectPlaylist = (playlistId) => {
    if (selectedTrack) {
      dispatch(addToPlaylist({ playlistId, track: selectedTrack }));
      setShowPlaylistMenu(false);
    }
  };
  
  return (
    <LibraryContainer>
      <BackgroundGradient />
      
      <ContentContainer>
        <Header>
          <Title>Your Library</Title>
          <ActionButtons>
            <Button onClick={() => setShowCreatePlaylistModal(true)}>
              <FaPlus /> Create Playlist
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <FaUpload /> Upload Track
            </Button>
          </ActionButtons>
        </Header>
        
        <SectionTitle>Your Playlists</SectionTitle>
        
        {playlists.length === 0 ? (
          <EmptyState>
            <p>You don't have any playlists yet.</p>
            <p>Create one to get started!</p>
          </EmptyState>
        ) : (
          <PlaylistGrid>
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} to={`/playlist/${playlist.id}`}>
                <PlaylistCover>
                  {playlist.cover ? (
                    <img src={playlist.cover} alt={playlist.name} />
                  ) : (
                    <FaMusic />
                  )}
                </PlaylistCover>
                <PlaylistInfo>
                  <PlaylistName>{playlist.name}</PlaylistName>
                  <PlaylistDetails>
                    {playlist.tracks ? playlist.tracks.length : 0} {playlist.tracks && playlist.tracks.length === 1 ? 'track' : 'tracks'}
                  </PlaylistDetails>
                </PlaylistInfo>
              </PlaylistCard>
            ))}
          </PlaylistGrid>
        )}
        
        {/* Uploaded Tracks Section */}
        {uploadedTracks.length > 0 && (
          <>
            <SectionTitle>Your Uploaded Tracks</SectionTitle>
            <TrackList>
              {uploadedTracks.map((track) => (
                <TrackItem key={track.id}>
                  <TrackImage>
                    {track.image ? (
                      <img src={track.image} alt={track.name} />
                    ) : (
                      <FaMusic />
                    )}
                  </TrackImage>
                  <TrackInfo>
                    <TrackName>{track.name}</TrackName>
                    <TrackArtist>{track.artist_name} • {track.playlistName}</TrackArtist>
                  </TrackInfo>
                  <TrackActions>
                    <PlayButton onClick={() => handlePlayTrack(track)}>
                      {currentTrack && currentTrack.id === track.id && isPlaying ? (
                        <FaPause />
                      ) : (
                        <FaPlay />
                      )}
                    </PlayButton>
                    <FavoriteButton 
                      isFavorite={isTrackFavorite(track.id)}
                      onClick={() => handleToggleFavorite(track.id)}
                    >
                      <FaHeart />
                    </FavoriteButton>
                    <AddToPlaylistButton onClick={() => handleAddToPlaylist(track)}>
                      <FaListUl />
                    </AddToPlaylistButton>
                    <DeleteButton onClick={() => handleDeleteTrack(track)}>
                      <FaTrash />
                    </DeleteButton>
                  </TrackActions>
                </TrackItem>
              ))}
            </TrackList>
          </>
        )}
        
        {/* Playlist Menu */}
        {showPlaylistMenu && (
          <PlaylistMenu ref={playlistMenuRef}>
            {playlists.map(playlist => (
              <PlaylistItem 
                key={playlist.id} 
                onClick={() => handleSelectPlaylist(playlist.id)}
              >
                <PlaylistName>{playlist.name}</PlaylistName>
                <PlaylistTrackCount>{playlist.tracks ? playlist.tracks.length : 0} tracks</PlaylistTrackCount>
              </PlaylistItem>
            ))}
          </PlaylistMenu>
        )}
        
        {/* Audio Player */}
        {currentTrack && (
          <AudioPlayer 
            ref={audioRef}
            src={currentTrack.audio}
            controls
            onEnded={() => setIsPlaying(false)}
          />
        )}
        
        {/* Create Playlist Modal */}
        <AnimatePresence>
          {showCreatePlaylistModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreatePlaylistModal(false)}
            >
              <ModalContent
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <ModalTitle>Create Playlist</ModalTitle>
                  <CloseButton onClick={() => setShowCreatePlaylistModal(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                
                <Form onSubmit={handleCreatePlaylist}>
                  <FormGroup>
                    <Label>Playlist Name</Label>
                    <Input 
                      type="text" 
                      value={playlistName} 
                      onChange={(e) => setPlaylistName(e.target.value)} 
                      placeholder="Enter playlist name"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea 
                      value={playlistDescription} 
                      onChange={(e) => setPlaylistDescription(e.target.value)} 
                      placeholder="Enter playlist description"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Cover Image</Label>
                    <CoverUpload onClick={handlePlaylistCoverClick}>
                      {playlistCover ? (
                        <CoverPreview>
                          <img src={URL.createObjectURL(playlistCover)} alt="Cover preview" />
                        </CoverPreview>
                      ) : (
                        <CoverPlaceholder>
                          <FaImage />
                          <span>Click to upload cover image</span>
                        </CoverPlaceholder>
                      )}
                    </CoverUpload>
                    <input 
                      type="file" 
                      ref={playlistCoverRef} 
                      onChange={handlePlaylistCoverChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                  </FormGroup>
                  
                  <ButtonGroup>
                    <Button type="submit">Create Playlist</Button>
                  </ButtonGroup>
                </Form>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
        
        {/* Upload Track Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
            >
              <ModalContent
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <ModalTitle>Upload Track</ModalTitle>
                  <CloseButton onClick={() => setShowUploadModal(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                
                <Form onSubmit={handleUploadTrack}>
                  <FormGroup>
                    <Label>Track Name</Label>
                    <Input 
                      type="text" 
                      value={trackName} 
                      onChange={(e) => setTrackName(e.target.value)} 
                      placeholder="Enter track name"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Artist Name</Label>
                    <Input 
                      type="text" 
                      value={trackArtist} 
                      onChange={(e) => setTrackArtist(e.target.value)} 
                      placeholder="Enter artist name"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Genre</Label>
                    <Input 
                      type="text" 
                      value={trackGenre} 
                      onChange={(e) => setTrackGenre(e.target.value)} 
                      placeholder="Enter genre"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Audio File</Label>
                    <FileUpload onClick={handleTrackFileClick}>
                      {trackFile ? (
                        <FilePreview>
                          <FaMusic />
                          <span>{trackFile.name}</span>
                        </FilePreview>
                      ) : (
                        <FilePlaceholder>
                          <FaMusic />
                          <span>Click to upload audio file</span>
                        </FilePlaceholder>
                      )}
                    </FileUpload>
                    <input 
                      type="file" 
                      ref={trackFileRef} 
                      onChange={handleTrackFileChange} 
                      accept="audio/*" 
                      style={{ display: 'none' }} 
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Cover Image</Label>
                    <CoverUpload onClick={handleTrackCoverClick}>
                      {trackCover ? (
                        <CoverPreview>
                          <img src={URL.createObjectURL(trackCover)} alt="Cover preview" />
                        </CoverPreview>
                      ) : (
                        <CoverPlaceholder>
                          <FaImage />
                          <span>Click to upload cover image</span>
                        </CoverPlaceholder>
                      )}
                    </CoverUpload>
                    <input 
                      type="file" 
                      ref={trackCoverRef} 
                      onChange={handleTrackCoverChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                  </FormGroup>
                  
                  <ButtonGroup>
                    <Button type="submit">Upload Track</Button>
                  </ButtonGroup>
                </Form>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </ContentContainer>
    </LibraryContainer>
  );
};

export default LibraryPage;