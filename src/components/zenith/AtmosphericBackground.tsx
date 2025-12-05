import React from 'react';

export const AtmosphericBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
      <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px] opacity-40" />
    </div>
  );
};
