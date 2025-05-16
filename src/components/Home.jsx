import React from 'react';
import Navbar from './Navbar';
import ThreeScene from './ThreeScene';

const Home = () => {
  return (
    <div className="w-full h-screen bg-zinc-900 overflow-hidden">
      <div className="absolute top-0 text-white left-0 w-full h-full z-[2]">
        <Navbar />
        <div className="absolute shipText opacity-0 bottom-8 text-2xl left-1/2 -translate-x-1/2 rounded-lg font-bold font-['Bellina'] text-center w-fit min-w-60 h-fit bg-transparent text-slate-900 p-2 backdrop-blur-lg">
          Hi, I am Vinay Pratap <br /> A Frontend Developer with passion for Building
        </div>
        <div id="font" className="font-['dune'] w-full h-[22%] font-display flex justify-center flex-col items-center">
          <div className="h-[7em] overflow-hidden relative">
            <div className="headings text-center h-full flex flex-col justify-between">
              <h1 className="text-center text-6xl font-light tracking-tighter">Work-Expo</h1>
              <h3 className="text-center fontt">A world where each continent showcases a different skill-set</h3>
            </div>
            <div className="headings h-full flex text-center flex-col justify-between">
              <h1 className="text-center text-6xl font-light tracking-tighter">Projectus</h1>
              <h3 className="text-center fontt">A nebula of creations, each a unique stellar formation</h3>
            </div>
            <div className="headings h-full flex flex-col text-center justify-between">
              <h1 className="text-center text-6xl font-light tracking-tighter pt-1">Contactious</h1>
              <h3 className="text-center fontt">Initiate signal transmission to the Celest core</h3>
            </div>
          </div>
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-white to-transparent mt-4"></div>
        </div>
      </div>
      <ThreeScene />
    </div>
  );
};

export default Home; 