import React from 'react';
import { assets } from '../assets/assets'; // Adjust the path based on your project

const StartRating = ({ rating = 5 }) => {
  return (
    <div className="flex">
      {Array(5).fill(0).map((_, index) => (
        <img
          key={index}
          src={rating > index ? assets.starIconFilled : assets.starIconOutlined}
          alt="star-icon"
          className="w-4.5 h-4.5"
        />
      ))}
    </div>
  );
};

export default StartRating;
