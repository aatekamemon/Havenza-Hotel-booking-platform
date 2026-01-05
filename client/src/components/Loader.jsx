import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { useParams } from 'react-router-dom'

const Loader = () => {
    const { navigate } = useAppContext();
    const { nextUrl } = useParams();
    
    useEffect(() => {
        if(nextUrl){
            setTimeout(() => {
                navigate(`/${nextUrl}`);
            }, 3000); // Reduced to 3 seconds for better UX
        }
    }, [nextUrl, navigate]);
    
    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-gray-900'></div>
            <p className='mt-4 text-gray-600'>Processing your payment...</p>
        </div>
    )
}

export default Loader