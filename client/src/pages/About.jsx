import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="About Us"
        subTitle="Discover our story, mission, and commitment to providing exceptional hospitality experiences worldwide."
        align="center"
      />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src={assets.roomServiceIcon} 
              alt="About Us" 
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold text-gray-800">
              Your Gateway to Exceptional Stays
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to our premier hotel booking platform, where comfort meets convenience. 
              We've been connecting travelers with their perfect accommodations since our inception, 
              building a reputation for reliability, quality, and exceptional customer service.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform features a carefully curated selection of hotels, from boutique properties 
              to luxury resorts, ensuring that every traveler finds their ideal home away from home.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <img src={assets.badgeIcon} alt="Mission" className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-playfair font-bold text-gray-800">Our Mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize the way people discover and book accommodations by providing 
              a seamless, transparent, and personalized booking experience that exceeds expectations.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <img src={assets.starIconFilled} alt="Vision" className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-playfair font-bold text-gray-800">Our Vision</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To become the world's most trusted and innovative hotel booking platform, 
              connecting millions of travelers with unforgettable experiences worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto mt-20">
        <h2 className="text-3xl font-playfair font-bold text-center text-gray-800 mb-12">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src={assets.searchIcon} alt="Easy Search" className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Easy Search</h4>
            <p className="text-gray-600">
              Find your perfect accommodation with our advanced search filters and intuitive interface.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src={assets.badgeIcon} alt="Best Prices" className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Best Prices</h4>
            <p className="text-gray-600">
              We guarantee competitive prices and exclusive deals you won't find anywhere else.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src={assets.userIcon} alt="24/7 Support" className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">24/7 Support</h4>
            <p className="text-gray-600">
              Our dedicated customer support team is available round the clock to assist you.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-6xl mx-auto mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold mb-2">10K+</h3>
            <p className="text-blue-100">Happy Customers</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">500+</h3>
            <p className="text-blue-100">Partner Hotels</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">50+</h3>
            <p className="text-blue-100">Cities Covered</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">99%</h3>
            <p className="text-blue-100">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <h2 className="text-3xl font-playfair font-bold text-center text-gray-800 mb-12">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <img src={assets.userIcon} alt="CEO" className="w-16 h-16" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-1">John Smith</h4>
            <p className="text-blue-600 mb-2">Chief Executive Officer</p>
            <p className="text-gray-600 text-sm">
              Leading our vision with 15+ years of hospitality industry experience.
            </p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <img src={assets.userIcon} alt="CTO" className="w-16 h-16" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-1">Sarah Johnson</h4>
            <p className="text-blue-600 mb-2">Chief Technology Officer</p>
            <p className="text-gray-600 text-sm">
              Driving innovation with cutting-edge technology solutions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <img src={assets.userIcon} alt="Head of Operations" className="w-16 h-16" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-1">Michael Brown</h4>
            <p className="text-blue-600 mb-2">Head of Operations</p>
            <p className="text-gray-600 text-sm">
              Ensuring seamless operations and exceptional customer experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Join thousands of satisfied travelers who trust us with their accommodation needs.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
          Start Booking Now
        </button>
      </div>
    </div>
  )
}

export default About
