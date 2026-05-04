import React, { useEffect, useRef } from 'react';
import Parallax from 'parallax-js';

const CrispoBackground: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => document.documentElement.classList.contains('dark'));
  const sceneRef = useRef<HTMLUListElement>(null);
  const parallaxInstance = useRef<Parallax | null>(null);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    if (sceneRef.current) {
      parallaxInstance.current = new Parallax(sceneRef.current, {
        relativeInput: true,
        hoverOnly: false,
        frictionX: 0.1,
        frictionY: 0.1,
        scalarX: 25,
        scalarY: 15,
      });
    }

    const centerInit = () => {
      const parentHeight = window.innerHeight;
      
      const sphere = document.querySelector('.sphere') as HTMLElement;
      if (sphere) {
        const sphereImg = sphere.querySelector('img');
        const sphereHeight = sphereImg?.offsetHeight || sphere.offsetHeight || 0;
        const topMargin = Math.max(0, (parentHeight - sphereHeight) / 2);
        sphere.style.marginTop = `${topMargin}px`;
      }

      const hero = document.querySelector('.hero') as HTMLElement;
      if (hero) {
        const heroHeight = hero.offsetHeight || 0;
        const heroTopMargin = Math.max(0, (parentHeight - heroHeight) / 2);
        hero.style.marginTop = `${heroTopMargin}px`;
      }
    };

    window.addEventListener('resize', centerInit);
    centerInit();
    
    // Fade out preloader if exists
    const preloader = document.querySelector('.preloader') as HTMLElement;
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 1000);
      }, 500);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', centerInit);
      if (parallaxInstance.current) {
        parallaxInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className={`crispo-bg-container fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000 ${isDarkMode ? 'bg-zinc-950' : 'bg-[#faf9f6]'}`}>
      <style>{`
        .wrapper {
          text-align: center;
          position: absolute;
          overflow: hidden;
          display: table-cell;
          height: 100%;
          width: 100%;
          left: 0;
          top: 0;
        }
        .scene, .layer {
          display: block;
          height: 100%;
          width: 100%;
          padding: 0;
          margin: 0;
        }
        .scene {
          position: relative;
          overflow: hidden;
        }
        .layer {
          position: absolute;
        }
        .background {
          background: url('./crispo-bg/images/background.jpg') no-repeat 50% 100%;
          bottom: -20px;
          background-size: cover;
          position: absolute;
          width: 110%;
          left: -5%;
          top: -5%;
        }
        .sphere img {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          display: block;
        }
        .hero {
          position: absolute;
          width: 100%;
          top: 0;
          text-align: center;
          z-index: 5;
        }
        .depth-1 img, .depth-2 img, .depth-3 img, .depth-4 img, .depth-5 img {
          max-width: 100%;
          height: auto;
        }
        .depth-5 { position: absolute; right: -10%; top: -10%; animation: wave 9s infinite linear; }
        .depth-4 { position: absolute; left: -3%; top: 15%; animation: wave 7s infinite linear; }
        .depth-3 { animation: wave 6s infinite linear; }
        .depth-3.flake1 { position: absolute; left: 20%; top: 40%; }
        .depth-3.flake2 { position: absolute; right: 25%; bottom: 25%; }
        .depth-3.flake3 { position: absolute; left: 20%; bottom: 20%; }
        .depth-2 { animation: wave 5s infinite linear; }
        .depth-2.flake1 { position: absolute; right: 40%; top: 40%; }
        .depth-1 { animation: wave 4s infinite linear; }
        .depth-1.flake1 { position: absolute; left: 30%; bottom: 20%; }
        .depth-1.flake2 { position: absolute; left: 15%; top: 25%; }

        @keyframes wave {
          0% { transform: rotateZ(0deg) translate3d(0,10%,0) rotateZ(0deg); }
          100% { transform: rotateZ(360deg) translate3d(0,10%,0) rotateZ(-360deg); }
        }

        @media (max-width: 768px) {
          .sphere img { width: 60% !important; }
          .hero h1 { font-size: 40px !important; }
          .crispo-text { font-size: clamp(40px, 12vw, 80px) !important; }
        }
      `}</style>
      
      <div className="wrapper">
        <ul className="scene unselectable" id="scene" ref={sceneRef}>
          <li className="layer" data-depth="0.10">
            <div className="background"></div>
          </li>
          <li className="layer" data-depth="0.25">
            <div className="sphere">
              <img alt="sphere" src="./crispo-bg/images/sphere.png" />
            </div>
          </li>
          <li className="layer" data-depth="0.30">
            <div className="hero pointer-events-auto">
              <p 
                className="crispo-text" 
                style={{ 
                  fontFamily: "'Fredoka One', cursive", 
                  fontSize: 'clamp(80px, 15vw, 180px)', 
                  backgroundImage: isDarkMode 
                    ? 'linear-gradient(135deg, #333333 0%, #ffffff 100%)' 
                    : 'linear-gradient(135deg, #E8E8E8 0%, #000000 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text', 
                  fontWeight: 400, 
                  letterSpacing: '2px', 
                  textTransform: 'uppercase', 
                  marginTop: '30px',
                  transition: 'all 1s ease'
                }}
              >
                crispo
              </p>
              <p style={{ marginTop: '20px', fontSize: '20px' }}>
                <a 
                  href="https://www.instagram.com/Lubuuii" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: isDarkMode ? '#ffffff' : '#1a1a1a', 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    fontWeight: 600, 
                    letterSpacing: '1px',
                    transition: 'color 1s ease'
                  }}
                >
                  <i className="fab fa-instagram" style={{ fontSize: '32px' }}></i>
                  @Lubuuii
                </a>
              </p>
            </div>
          </li>
          <li className="layer" data-depth="0.40">
            <div className="depth-1 flake1"><img alt="flake" src="./crispo-bg/images/flakes/depth1/flakes1.png" /></div>
            <div className="depth-1 flake2"><img alt="flake" src="./crispo-bg/images/flakes/depth1/flakes2.png" /></div>
          </li>
          <li className="layer" data-depth="0.50">
            <div className="depth-2 flake1"><img alt="flake" src="./crispo-bg/images/flakes/depth2/flakes1.png" /></div>
          </li>
          <li className="layer" data-depth="0.60">
            <div className="depth-3 flake1"><img alt="flake" src="./crispo-bg/images/flakes/depth3/flakes1.png" /></div>
            <div className="depth-3 flake2"><img alt="flake" src="./crispo-bg/images/flakes/depth3/flakes2.png" /></div>
            <div className="depth-3 flake3"><img alt="flake" src="./crispo-bg/images/flakes/depth3/flakes3.png" /></div>
          </li>
          <li className="layer" data-depth="0.80">
            <div className="depth-4"><img alt="flake" src="./crispo-bg/images/flakes/depth4/flakes.png" /></div>
          </li>
          <li className="layer" data-depth="1.00">
            <div className="depth-5"><img alt="flake" src="./crispo-bg/images/flakes/depth5/flakes.png" /></div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CrispoBackground;
