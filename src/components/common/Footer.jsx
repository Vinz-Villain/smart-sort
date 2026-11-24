import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="font-bold text-slate-900 text-sm">SmartSort<span className="text-blue-600">.Ai</span></span>
          <span>• SIJA IoT & AI Project</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          ESP32 Microcontroller • OV2640 AI Camera • DHT11 & MQ-135 • Servo SG90 Diverter
        </div>
      </div>
    </footer>
  );
}
