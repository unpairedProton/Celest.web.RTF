import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full px-6 h-[10%] flex justify-between items-center">
      <h1 className="font-bold text-lg font-['dune']">Celest</h1>
      <div className="flex space-x-6 font-semibold">
        <a href="">Work</a>
        <a href="">Projects</a>
        <a href="">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar; 