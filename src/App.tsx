import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Preprocessing from './pages/Preprocessing';
import SingleAnalysis from './pages/SingleAnalysis';
import BatchAnalysis from './pages/BatchAnalysis';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/preprocessing" element={<Preprocessing />} />
            <Route path="/single-analysis" element={<SingleAnalysis />} />
            <Route path="/batch-analysis" element={<BatchAnalysis />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;