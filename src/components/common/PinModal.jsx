import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, X, ShieldAlert, KeyRound, Delete } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onVerify }) {
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  // Reset digits and focus first input on open
  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setIsSubmitting(false);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 50);
    }
  }, [isOpen]);

  const submitPin = useCallback((digits) => {
    const fullPin = digits.join('');
    if (fullPin.length !== 6) {
      setErrorMessage('Masukkan 6 digit PIN lengkap');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const isSuccess = onVerify(fullPin);
    if (!isSuccess) {
      setErrorMessage('PIN Salah. Silakan coba lagi.');
      setPinDigits(['', '', '', '', '', '']);
      setIsSubmitting(false);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  }, [onVerify]);

  const handleChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);
    setErrorMessage('');

    // Advance to next box if digit entered
    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit if all 6 digits filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      submitPin(newDigits);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const newDigits = pasteData.split('');
      setPinDigits(newDigits);
      submitPin(newDigits);
    }
  };

  const handleKeypadPress = (val) => {
    if (val === 'backspace') {
      const lastFilledIndex = [...pinDigits].reverse().findIndex((d) => d !== '');
      if (lastFilledIndex !== -1) {
        const actualIndex = 5 - lastFilledIndex;
        const newDigits = [...pinDigits];
        newDigits[actualIndex] = '';
        setPinDigits(newDigits);
        if (inputRefs.current[actualIndex]) inputRefs.current[actualIndex].focus();
      }
    } else {
      const firstEmptyIndex = pinDigits.findIndex((d) => d === '');
      if (firstEmptyIndex !== -1) {
        handleChange(firstEmptyIndex, String(val));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
          <KeyRound className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight m-0 flex items-center gap-2">
          <span>Otentikasi Operator</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            6 DIGIT
          </span>
        </h3>
        <p className="text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed font-normal">
          Masukkan 6 digit PIN operator untuk mengakses kontrol aktuator fisik dan data sensitif.
        </p>

        {/* 6 Digit Input Boxes */}
        <div className="my-5 flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {pinDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e.key)}
              className={`w-10 sm:w-11 h-12 sm:h-13 rounded-xl sm:rounded-2xl text-center text-lg sm:text-xl font-bold text-slate-900 transition-all border outline-none ${
                errorMessage
                  ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500'
                  : digit
                  ? 'border-blue-500 bg-blue-50/30 text-blue-700'
                  : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
          ))}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-700 animate-in fade-in">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Numeric Keypad for Mobile/Touch */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-800 font-bold text-sm transition cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPinDigits(['', '', '', '', '', ''])}
            className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold text-xs transition cursor-pointer"
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress(0)}
            className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-800 font-bold text-sm transition cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('backspace')}
            className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => submitPin(pinDigits)}
            disabled={isSubmitting || pinDigits.some((d) => d === '')}
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Buka Kunci</span>
          </button>
        </div>
      </div>
    </div>
  );
}
