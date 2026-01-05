import React from 'react';
import Title from './Title';
import StartRating from './StartRating'; // ✅ use the external component
import { testimonials } from '../assets/assets';

const Testimonial = () => {
  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30'>
      <Title 
        title="What Our Guests Say"
        subTitle="Discover why discerning travelers consistently choose QuickStay for their exclusive and luxurious accommodations around the world." 
      />

      <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
        <TestimonialCard 
          name="Donald Jackman"
          role="Content Creator"
          img="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100"
          rating={5}
          review="I've been using imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier."
        />
        <TestimonialCard 
          name="Sara Mitchell"
          role="Travel Blogger"
          img="https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=100"
          rating={5}
          review="QuickStay has transformed my travel experiences. Their luxury rentals are top-notch and make me feel right at home wherever I go."
        />
        <TestimonialCard 
          name="Michael Chen"
          role="Entrepreneur"
          img="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=100"
          rating={4}
          review="Booking with QuickStay is always smooth. The attention to detail and premium service makes them stand out from the rest."
        />
      </div>
    </div>
  );
};

const TestimonialCard = ({ name, role, img, rating, review }) => (
  <div className="text-sm w-96 border border-gray-200 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden">
    <div className="flex items-center gap-4 px-5 py-4 bg-red-500/10">
      <img className="h-12 w-12 rounded-full" src={img} alt={`${name}'s profile`} />
      <div>
        <h1 className="text-lg font-medium text-gray-800">{name}</h1>
        <p className="text-gray-800/80">{role}</p>
      </div>
    </div>
    <div className="p-5 pb-7">
      <StartRating rating={rating} />  {/* ✅ now uses imported version only */}
      <p className="text-gray-500 mt-5">{review}</p>
    </div>
    <a href="#" className="text-red-500 underline px-5">Read more</a>
  </div>
);

export default Testimonial;
