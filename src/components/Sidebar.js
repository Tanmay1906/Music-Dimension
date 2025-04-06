import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaHome, 
  FaSearch, 
  FaMusic, 
  FaPlus, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import { logout } from '../store/authSlice';
import { createPlaylist } from '../store/librarySlice';
import { motion, AnimatePresence } from 'framer-motion';

// Animation keyframes
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

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

const SidebarContainer = styled.aside`
  width: 240px;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  color: #b3b3b3;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  
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
  
  @media (max-width: 768px) {
    position: fixed;
    left: ${props => props.isOpen ? '0' : '-240px'};
    top: 0;
    bottom: 0;
    z-index: 100;
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 101;
  background: rgba(15, 15, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(26, 26, 46, 0.9);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 99;
  backdrop-filter: blur(3px);
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const Logo = styled.div`
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  position: relative;
  display: flex;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.3));
    border-radius: 2px;
    animation: ${glow} 2s infinite;
  }
`;

const NavSection = styled.div`
  margin-bottom: 24px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    width: 30px;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const NavHeader = styled.h2`
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
`;

const NavItem = styled.li`
  margin-bottom: 8px;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 2px;
    background: #ffffff;
    transform: scaleY(0);
    transition: transform 0.3s ease;
    transform-origin: top;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  &:hover::before {
    transform: scaleY(1);
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${props => props.active ? '#ffffff' : '#b3b3b3'};
  text-decoration: none;
  padding: 8px 0;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: #ffffff;
    transform: translateX(5px);
  }
  
  svg {
    margin-right: 12px;
    color: ${props => props.active ? '#ffffff' : '#b3b3b3'};
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    color: #ffffff;
    transform: scale(1.2);
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  color: #b3b3b3;
  text-align: left;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffffff;
    transform: translateX(5px);
  }
  
  svg {
    margin-right: 12px;
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    color: #ffffff;
    transform: scale(1.2);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

const BackgroundEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
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

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { playlists } = useSelector((state) => state.library);
  const [isOpen, setIsOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [visualizerBars, setVisualizerBars] = useState([]);
  const [isMounted, setIsMounted] = useState(true);
  const sidebarRef = useRef(null);
  
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
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          isOpen && window.innerWidth <= 768) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleCreatePlaylist = () => {
    const name = prompt('Enter playlist name:');
    if (name) {
      dispatch(createPlaylist({ name }));
    }
  };
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      <MobileToggle onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </MobileToggle>
      
      <Overlay isOpen={isOpen} onClick={() => setIsOpen(false)} />
      
      <SidebarContainer ref={sidebarRef} isOpen={isOpen}>
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
        
        <Logo>Music Dimension</Logo>
        
        <NavSection>
          <NavList>
            <NavItem>
              <NavLink to="/" active={location.pathname === '/' ? 1 : 0}>
                <FaHome /> Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/search" active={location.pathname === '/search' ? 1 : 0}>
                <FaSearch /> Search
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/library" active={location.pathname === '/library' ? 1 : 0}>
                <FaMusic /> Your Library
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/artist/1" active={location.pathname.startsWith('/artist/') ? 1 : 0}>
                <FaUser /> Artists
              </NavLink>
            </NavItem>
          </NavList>
        </NavSection>
        
        <NavSection>
          <NavHeader>Playlists</NavHeader>
          <Button onClick={handleCreatePlaylist}>
            <FaPlus /> Create Playlist
          </Button>
          
          <Divider />
          
          <NavList>
            {playlists.map((playlist) => (
              <NavItem key={playlist.id}>
                <NavLink 
                  to={`/playlist/${playlist.id}`}
                  active={location.pathname === `/playlist/${playlist.id}` ? 1 : 0}
                >
                  {playlist.name}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </NavSection>
        
        <Divider />
        
        <Button onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </Button>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;