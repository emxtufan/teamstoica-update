import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Disciplines from './components/Disciplines';
import Schedule from './components/Schedule';
import Coaches from './components/Coaches';
import TrainerPrograms from './components/TrainerPrograms';
import Competitions from './components/Competitions';
import Testimonials from './components/Testimonials';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import CoachProfile from './components/CoachProfile';
import DotField from './components/DotField';
import InitialLoader from './components/InitialLoader';
import { LocationConfigProvider } from './components/LocationConfigProvider';

import FullGallery from './components/FullGallery';
import AdminPanel from './components/AdminPanel';

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);
  return null;
}

function HomePage() {
  useEffect(() => {
    const sectionId = sessionStorage.getItem('scrollToSection');
    if (!sectionId) return;

    sessionStorage.removeItem('scrollToSection');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Features />
      <Disciplines />
      <Schedule />
      <Coaches />
      <TrainerPrograms />
      <Competitions />
      <Testimonials />
      <Gallery />
      <Contact />
      <FinalCTA />
    </>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname !== '/admin';
  });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (isAdminRoute) {
      setIsInitialLoading(false);
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;
    const startedAt = performance.now();

    const finishLoading = () => {
      const remaining = Math.max(0, 1150 - (performance.now() - startedAt));
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }, remaining);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', finishLoading);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isAdminRoute]);

  useEffect(() => {
    if (!isInitialLoading) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isInitialLoading]);

  return (
      <div className={`dotfield-page relative min-h-screen bg-black text-white selection:bg-accent selection:text-black ${isAdminRoute ? 'admin-route' : ''}`}>
        <InitialLoader visible={!isAdminRoute && isInitialLoading} />
        <div className="pointer-events-none fixed inset-0 z-0 opacity-90">
          <DotField
            dotRadius={2.2}
            dotSpacing={16}
            bulgeStrength={67}
            glowRadius={160}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="rgba(163, 0, 0, 0.58)"
            gradientTo="rgba(255, 255, 255, 0.34)"
            glowColor="#120F17"
          />
        </div>
        <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_50%_0%,rgba(163,0,0,0.12),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.78))]" />
        <ScrollToTop />
        {/* Progress Bar */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 bg-accent z-[60] origin-left" 
          style={{ scaleX }} 
        />

        {!isAdminRoute && <Navbar />}
        
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/coach/:id" element={<CoachProfile />} />
            <Route path="/galerie" element={<FullGallery />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        {!isAdminRoute && <div className="relative z-10">
          <Footer />
        </div>}
      </div>
  );
}

export default function App() {
  return (
    <Router>
      <LocationConfigProvider>
        <AppLayout />
      </LocationConfigProvider>
    </Router>
  );
}
