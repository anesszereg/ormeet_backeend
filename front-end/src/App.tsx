import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MyTicketsPage from './pages/MyTicketsPage';
import SearchResult from './pages/SearchResult';
import EventDetailsSearchResults from './pages/EventDetailsSearchResults';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/event/:eventId" element={<EventDetailsSearchResults />} />
          <Route path="/" element={<Navigate to="/my-tickets" replace />} />
          {/* Add more routes here as needed */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
