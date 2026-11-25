import React from 'react';
import smartsortLogo from '../../assets/smartsort-logo.png';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100/80 bg-white py-6 px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <img
            src={smartsortLogo}
            alt="SmartSort Logo"
            className="h-5 sm:h-6 w-auto object-contain select-none"
          />
          <span>• SIJA IoT &amp; AI Project</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          ESP32 Microcontroller • OV2640 AI Camera • DHT11 & MQ-135 • Servo SG90 Diverter
        </div>
      </div>
    </footer>
  );
}
