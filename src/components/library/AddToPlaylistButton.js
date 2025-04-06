import React, { useState } from 'react';
import styled from 'styled-components';
import { FaListUl } from 'react-icons/fa';
import PlaylistMenu from './PlaylistMenu';

const Button = styled.button`
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
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AddToPlaylistButton = ({ track }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const handleClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  
  const handleClose = () => {
    setShowMenu(false);
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <Button onClick={handleClick}>
        <FaListUl />
      </Button>
      {showMenu && <PlaylistMenu track={track} onClose={handleClose} />}
    </div>
  );
};

export default AddToPlaylistButton; 