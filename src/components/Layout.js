import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './player/Player';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #121212;
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <ContentContainer>
        <Sidebar />
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentContainer>
      <Player />
    </LayoutContainer>
  );
};

export default Layout;