import Logotipo from '../assets/Logotipo.png';

const LogoSVG = () => {
  return (
    <div className="logo-container">
      <img 
        src={Logotipo} 
        alt="Elitex Logo" 
        className="logo-image logo-gray"
      />
      <img 
        src={Logotipo} 
        alt="Elitex Logo" 
        className="logo-image logo-red"
      />
    </div>
  );
};

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-content">
        {/* ← QUITAMOS el logo-wrapper, va directo */}
        <LogoSVG />
        
       
      </div>
    </div>
  );
};

export default LoadingScreen;
