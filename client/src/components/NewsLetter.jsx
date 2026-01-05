import React from 'react';
import { assets } from '../assets/assets';

const NewsLetter = () => {
  return (
    <div className="px-4 py-12 md:py-16 bg-gray-900 text-white">
      <div className="flex flex-col items-center max-w-5xl w-full rounded-2xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">Stay Inspired</h2>
        <p className="text-gray-400 text-center max-w-md">
          Stay updated with our latest offers, travel inspiration, and premium accommodation news.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-xl">
          <input
            type="email"
            className="bg-white/10 text-white placeholder-white/70 px-4 py-2.5 border border-white/20 rounded outline-none w-full"
            placeholder="Enter your email"
            aria-label="Email address"
          />
          <button
            className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all"
            aria-label="Subscribe to newsletter"
          >
            Subscribe
            <img
              src={assets.arrowIcon}
              alt="arrow icon"
              className="w-3.5 invert group-hover:translate-x-1 transition-all"
            />
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center max-w-md">
          By subscribing, you agree to our Privacy Policy and consent to receive updates.
        </p>
      </div>
    </div>
  );
};

export default NewsLetter;
