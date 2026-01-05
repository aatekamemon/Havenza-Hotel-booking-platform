export const getUserData=async(req, res)=>{
    try{
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success:true,role,recentSearchedCities});
    }catch(error){
        res.json({success:false,message:error.message});                                
    }
}

//store recent searched cities
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (!recentSearchedCity || typeof recentSearchedCity !== "string") {
            return res.status(400).json({ success: false, message: "recentSearchedCity is required" });
        }
        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity);
        } else { 
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        res.json({ success: true, message: "Recent searched city stored" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

