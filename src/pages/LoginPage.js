import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { loginUser } from '../store/authSlice';
import MusicScene from '../components/MusicScene';
import '../styles/AuthStyles.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError, isAuthenticated } = useSelector((state) => state.auth);
  const controls = useAnimation();
  
  // Memoize the navigation function to prevent unnecessary re-renders
  const handleNavigation = useCallback(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    handleNavigation();
    controls.start("visible");
    
    // Cleanup function
    return () => {
      controls.stop();
    };
  }, [isAuthenticated, controls, handleNavigation]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate particles for background
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    style: {
      background: i % 2
        ? "radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent)"
        : "radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent)",
      width: `${Math.random() * 20 + 10}px`,
      height: `${Math.random() * 20 + 10}px`,
    }
  }));

  // Generate visualizer bars
  const visualizerBars = Array.from({ length: window.innerWidth > 768 ? 40 : 20 }).map((_, i) => ({
    id: i,
    style: {
      width: `${100 / (window.innerWidth > 768 ? 40 : 20)}%`,
      animationDelay: `${i * 0.05}s`,
    }
  }));
  
  return (
    <div className="auth-container">
      <MusicScene />
      
      <div className="particles">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              scale: Math.random() * 0.5 + 0.5,
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
            style={particle.style}
          />
        ))}
      </div>

      <motion.div
        className="auth-content"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.h1
          className="auth-title"
          variants={{
            hidden: { y: -50, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
        >
          MUSIC DIMENSION
        </motion.h1>

        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          variants={{
            hidden: { scale: 0.8, opacity: 0 },
            visible: { scale: 1, opacity: 1 },
          }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <motion.button
            type="submit"
            className="auth-button"
            disabled={loading || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading || isLoading ? 'Logging in...' : 'Log In'}
          </motion.button>
          
          {(error || authError) && <div className="error-message">{error || authError}</div>}
          
          <Link to="/register" className="auth-link">
            Don't have an account? Sign up
          </Link>
        </motion.form>
      </motion.div>

      <div className="visualizer">
        {visualizerBars.map((bar) => (
          <motion.div
            key={bar.id}
            className="bar"
            animate={{
              height: `${Math.random() * 80 + 20}%`,
              opacity: Math.random() * 0.5 + 0.5,
            }}
            transition={{
              duration: Math.random() * 0.5 + 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={bar.style}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginPage;