import axios from "axios";
import { createContext , useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useUser, useAuth} from "@clerk/clerk-react";
import { toast } from 'react-hot-toast';


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
const AppContext = createContext();

export const AppProvider = ({ children })=>{

	const currency = import.meta.env.VITE_CURRENCY || "INR";
	const navigate = useNavigate();
	const {user} = useUser();
	const { getToken } = useAuth()
	
	const [isOwner, setIsOwner] = useState(false)
	const [showHotelReg, setShowHotelReg] = useState(false)
	const [searchedCities, setSearchedCities] = useState([]) 
	const [rooms, setRooms] = useState([])
	const [hotelStatus, setHotelStatus] = useState(null)
	const [showStatusPopup, setShowStatusPopup] = useState(false)
	const [statusPopupDismissed, setStatusPopupDismissed] = useState(false)
	const [isAdmin, setIsAdmin] = useState(false)

	const fetchRooms = async() =>{
		try{
			const {data} = await axios.get('/api/rooms')
			if(data.success){
				setRooms(data.rooms);
			}
			else{
				toast.error(data.message);
			}
		}catch(error){
			console.log(error);
			toast.error(error.message);
		}
	}

	const refreshRooms = async() =>{
		await fetchRooms();
	}

	// Check if user is admin based on localStorage token
	const checkIfAdmin = () => {
		const adminToken = localStorage.getItem('admin_token');
		const isAdminUser = !!adminToken;
		setIsAdmin(isAdminUser);
		return isAdminUser;
	}

	
	const fetchUser = async ()=>{
		try {
			const {data} = await axios.get('/api/user', {headers: {Authorization: `Bearer ${await getToken()}`}})
			if(data.success){
				setIsOwner(data.role === "hotelOwner");
				setSearchedCities(data.recentSearchedCities)
				// Check hotel status for all users
				await checkHotelStatus();
			}else{
				//retry fetching using details after 5 seconds
				setTimeout(()=>{
					fetchUser()
				},5000)
			}
		}catch(error){
			toast.error(error.message)
		}
	}

	const checkHotelStatus = async () => {
		try {
			const {data} = await axios.get('/api/hotels/status', {headers: {Authorization: `Bearer ${await getToken()}`}})
			if(data.success){
				const status = data.hotel?.status || null;
				const previousStatus = hotelStatus;
				setHotelStatus(status);
				
				// Show popup for pending or rejected status if not dismissed
				if((status === "pending" || status === "rejected") && !statusPopupDismissed){
					console.log('Setting popup to show:', { status, statusPopupDismissed });
					setShowStatusPopup(true);
				}
				
				if(status === "approved"){
					setIsOwner(true);
					setShowStatusPopup(false);
					// If status changed from pending to approved, show success message
					if(previousStatus === "pending"){
						toast.success("🎉 Your hotel has been approved! You now have access to the dashboard.");
					}
				} else if(status === "rejected"){
					setIsOwner(false);
					// If status changed from pending to rejected, show popup
					if(previousStatus === "pending"){
						setShowStatusPopup(true);
						setStatusPopupDismissed(false);
					}
				} else if(status === "pending"){
					setIsOwner(false);
				}
			}
		}catch(error){
			// Hotel not found or other error - user doesn't have a hotel
			setHotelStatus(null);
			setShowStatusPopup(false);
		}
	}


	useEffect(()=>{
		if(user){
		fetchUser();
		}
	},[user])

	useEffect(() => {
		fetchRooms();
	},[]);

	// Check admin status on mount and when location changes
	useEffect(() => {
		checkIfAdmin();
		
		// Listen for storage changes (admin login/logout)
		const handleStorageChange = (e) => {
			if (e.key === 'admin_token') {
				checkIfAdmin();
			}
		};
		
		window.addEventListener('storage', handleStorageChange);
		
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	// Add periodic checking for hotel status updates (every 10 seconds)
	useEffect(() => {
		if (user) {
			const interval = setInterval(() => {
				checkHotelStatus();
			}, 10000); // Check every 10 seconds
			
			return () => clearInterval(interval);
		}
	}, [user]);

	const value ={
		currency, navigate, user, getToken, isOwner, setIsOwner, axios,
		showHotelReg, setShowHotelReg,searchedCities,setSearchedCities ,rooms, setRooms, refreshRooms,
		hotelStatus, setHotelStatus, checkHotelStatus, showStatusPopup, setShowStatusPopup, 
		statusPopupDismissed, setStatusPopupDismissed, isAdmin, checkIfAdmin
	}

	return(
		<AppContext.Provider value={value}>
			{children}
		</AppContext.Provider>

	)	
}

export const useAppContext = ()=> useContext(AppContext);