import React, { useState, useEffect } from 'react';

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg min-w-[300px]">
      <h3 className="text-lg font-semibold mb-4">🕐 Live Clock</h3>
      <div className="text-center">
        <div className="text-4xl font-bold mb-2 font-mono">
          {time.toLocaleTimeString()}
        </div>
        <div className="text-sm opacity-90 mb-4">
          {time.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div className="bg-white/20 rounded-lg p-2">
          <div className="text-xs opacity-75">Time Zone</div>
          <div className="font-semibold">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveClock;