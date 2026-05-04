import React, { useEffect } from 'react';

declare global {
  interface Window {
    jQuery: any;
  }
}

const CrispoBackground: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initBackground = async () => {
      try {
        // Load jQuery first
        if (!window.jQuery) {
          await loadScript('/crispo-bg/js/jquery.js');
        }
        // Load parallax plugin
        await loadScript('/crispo-bg/js/plugins.js');
        
        // Manual initialization instead of relying on main.js window.load
        const $ = window.jQuery;
        if ($ && $.fn.parallax) {
          const $scene = $('#scene');
          
          // Enhanced parallax configuration for "Velocity" feel
          // increased friction and calibrated scalars for smooth performance
          const parallaxConfig = {
            scalarX: 20,
            scalarY: 10,
            frictionX: 0.15, // Smooth velocity feel
            frictionY: 0.15,
            limitX: false,
            limitY: false,
            originX: 0.5,
            originY: 0.5,
            pointerEvents: true,
            hoverOnly: false,
            calibrateX: true,
            calibrateY: true,
            invertX: true,
            invertY: true
          };

          $scene.parallax(parallaxConfig);

          // Handle Gyroscope permission and Calibration for Mobile
          const handleFirstInteraction = async () => {
            if (typeof (window as any).DeviceOrientationEvent !== 'undefined' && 
                typeof (window as any).DeviceOrientationEvent.requestPermission === 'function') {
              try {
                const permission = await (window as any).DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                  // Enable gyroscope support
                  $scene.parallax('enable');
                  // Re-calibrate for the current holding position
                  setTimeout(() => {
                    $scene.parallax('calibrate', true, true);
                  }, 100);
                }
              } catch (error) {
                console.error("Gyro permission denied:", error);
              }
            }
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
          };
          window.addEventListener('click', handleFirstInteraction);
          window.addEventListener('touchstart', handleFirstInteraction);
          
          // Ultra-smooth centering logic using ResizeObserver
          const centerInit = () => {
            const sphereContent = $('.sphere');
            const sphereImg = sphereContent.find('img');
            const sphereHeight = sphereImg.height() || sphereContent.height() || 0;
            const parentHeight = $(window).height() || 0;
            const topMargin = Math.max(0, (parentHeight - sphereHeight) / 2);
            sphereContent.css({ "margin-top": topMargin + "px" });

            const heroContent = $('.hero');
            const heroHeight = heroContent.height() || 0;
            const heroTopMargin = Math.max(0, (parentHeight - heroHeight) / 2);
            heroContent.css({ "margin-top": heroTopMargin + "px" });
          };

          centerInit();
          $(window).on('resize orientationchange', centerInit);
          
          // Re-center as images load
          const imgs = document.querySelectorAll('.scene img');
          imgs.forEach(img => {
            img.addEventListener('load', centerInit);
          });

          // Delayed centerings for dynamic layouts
          setTimeout(centerInit, 200);
          setTimeout(centerInit, 1000);
          setTimeout(centerInit, 3000); // Late catch
          
          $('.preloader').fadeOut('slow');
        }
      } catch (error) {
        console.error('Failed to load background scripts:', error);
      }
    };

    initBackground();

    return () => {
      observer.disconnect();
      // Cleanup resize listener
      if (window.jQuery) {
        window.jQuery(window).off('resize');
      }
    };
  }, []);

  return (
    <>
      <link href="/crispo-bg/css/loader.css" rel="stylesheet" type="text/css" />
      <link href="/crispo-bg/css/normalize.css" rel="stylesheet" type="text/css" />
      <link href="/crispo-bg/css/style.css" rel="stylesheet" type="text/css" />
      
      <div className={`crispo-bg-container fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000 ${isDarkMode ? 'bg-zinc-950' : 'bg-[#faf9f6]'}`}>
        <style>{`
          @media (max-width: 768px) {
            .sphere img {
              width: 60% !important;
              max-width: 300px !important;
            }
            .hero h1 {
              font-size: 40px !important;
            }
            .crispo-text {
              font-size: clamp(40px, 12vw, 80px) !important;
            }
          }
        `}</style>
        <div className="preloader">
          <div className="loading">
            <h2 className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold`}>Loading...</h2>
            <span className="progress"></span>
          </div>
        </div>
        
        {/* Theme Overlay removed */}
        <div className={`absolute inset-0 z-[5] transition-opacity duration-1000 pointer-events-none ${isDarkMode ? 'opacity-0' : 'bg-transparent opacity-0'}`} />

        <div className="wrapper">
          <ul className="scene unselectable" data-friction-x="0.1" data-friction-y="0.1" data-scalar-x="25" data-scalar-y="15" id="scene">
            <li className="layer" data-depth="0.00"></li>
            <li className="layer" data-depth="0.10">
              <div className="background" style={{ 
                backgroundImage: 'url(/crispo-bg/images/background.jpg)',
                filter: 'none',
                transition: 'filter 1s ease'
              }}></div>
            </li>
            <li className="layer" data-depth="0.20">
              <div className="title">
                <h2></h2>
                <span className="line"></span>
              </div>
            </li>
            <li className="layer" data-depth="0.25">
              <div className="sphere">
                <img alt="sphere" src="/crispo-bg/images/sphere.png" />
              </div>
            </li>
            <li className="layer" data-depth="0.30">
              <div className="hero pointer-events-auto">
                <h1></h1>
                <p className="sub-title"></p>
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
              <div className="depth-1 flake1"><img alt="flake" src="/crispo-bg/images/flakes/depth1/flakes1.png" /></div>
              <div className="depth-1 flake2"><img alt="flake" src="/crispo-bg/images/flakes/depth1/flakes2.png" /></div>
              <div className="depth-1 flake3"><img alt="flake" src="/crispo-bg/images/flakes/depth1/flakes3.png" /></div>
              <div className="depth-1 flake4"><img alt="flake" src="/crispo-bg/images/flakes/depth1/flakes4.png" /></div>
            </li>
            <li className="layer" data-depth="0.50">
              <div className="depth-2 flake1"><img alt="flake" src="/crispo-bg/images/flakes/depth2/flakes1.png" /></div>
              <div className="depth-2 flake2"><img alt="flake" src="/crispo-bg/images/flakes/depth2/flakes2.png" /></div>
            </li>
            <li className="layer" data-depth="0.60">
              <div className="depth-3 flake1"><img alt="flake" src="/crispo-bg/images/flakes/depth3/flakes1.png" /></div>
              <div className="depth-3 flake2"><img alt="flake" src="/crispo-bg/images/flakes/depth3/flakes2.png" /></div>
              <div className="depth-3 flake3"><img alt="flake" src="/crispo-bg/images/flakes/depth3/flakes3.png" /></div>
              <div className="depth-3 flake4"><img alt="flake" src="/crispo-bg/images/flakes/depth3/flakes4.png" /></div>
            </li>
            <li className="layer" data-depth="0.80">
              <div className="depth-4"><img alt="flake" src="/crispo-bg/images/flakes/depth4/flakes.png" /></div>
            </li>
            <li className="layer" data-depth="1.00">
              <div className="depth-5"><img alt="flake" src="/crispo-bg/images/flakes/depth5/flakes.png" /></div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default CrispoBackground;
