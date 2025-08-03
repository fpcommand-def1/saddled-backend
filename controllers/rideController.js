import mongoose from 'mongoose';
import ridesModel from '../models/ridesModel.js';
import userModel from '../models/userModel.js';

//Route for ride creation
const addRide = async (req,res) => {

    try{
        const {userId, title, from, to, date, duration, description, contact} = req.body;
        
        let ridesData = await userModel.findById(userId);

        const rideData = {
            title,
            from, 
            to,
            date, 
            duration: Number(duration),
            description,
            contact,
            createdBy: userId               
        }

        const ride = new ridesModel(rideData);
        await ride.save();
        //console.log(ride._id);
        await userModel.findByIdAndUpdate(userId, {$push: {ridesData: ride._id}}, {new: true});
        await ridesModel.findByIdAndUpdate(ride._id, {$push: {riders: userId}}, {new: true});
        

        res.json({success:true, message:"Ride added successfully"});

    }
    catch(error){
        console.log(error);
        res.json({success:false, message:error.message});
    }

}

//Route for listing particular ride
const getRideData = async (req, res) => {
    try{
        let tmpNameArr=[]
        const ride = await ridesModel.findById(req.body.id);
         if(!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
         }
         //console.log(ride.riders);
         for (let i = 0; i <  ride.riders.length; i++) {
            let a = await userModel.findById(ride.riders[i])
            tmpNameArr.push(a.name)
         }
        
      
         res.json({success: true, rideData : ride, riders: tmpNameArr});
         
    }
    catch(error)
    {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//Route for ride deletion
// const deleteRide = async (req, res) => {
//     try{
//         const {userId, rideId} = req.body;
        
//         await ridesModel.findByIdAndDelete(rideId);

//         await userModel.findByIdAndUpdate(userId, {$pull: {ridesData: rideId}}, {new:true});

//         res.json({success:true, message:"Ride Deleted Successfully"});
//     }
//     catch(error){
//         console.log(error);
//         res.json({success:false, message:error.message});
//     }
// }

const deleteRide = async (req, res) => {
     try {
        const { rideId, userId } = req.body;

        //Get the ride first to find all associated riders
        const ride = await ridesModel.findById(rideId);
        const user = await userModel.findById(userId);
        if (!ride || !user) {
            return res.status(404).json({ success: false, message: "Ride or User not found" });
        }

    
        if (!user._id.equals(ride.createdBy)){
            return res.json({ success: false, message: 'This one is not your masterpiece' });
        }

        const riderIds = ride.riders; // array of user ObjectIds

        //Delete the ride
        await ridesModel.findByIdAndDelete(rideId);

        //Remove rideId from all users' ridesData arrays
        await userModel.updateMany(
            { _id: { $in: riderIds } },
            { $pull: { ridesData: rideId } }
        );

        res.json({ success: true, message: "Ride deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}




//Route for listing all rides
const listAllRides = async (req,res) => {
    try{
        const rides = await ridesModel.find({});
        res.json({success:true, rides});
    }
    catch(error)
    {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//Route for listing particular users all rides
const listUserRide = async (req, res) => {
    try{
       let tmpArr=[];
       let tmpArr2=[];
        
        const user = await userModel.findById(req.body.id);
         if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
         }
         for (let i = 0; i <  user.ridesData.length; i++) {
            tmpArr.push(await ridesModel.findById(user.ridesData[i]))
         }
        const allRides = await ridesModel.find({});
        tmpArr2 = allRides.filter(ride => !user.ridesData.includes(ride._id));
            
      
         res.json({success: true, userRides: tmpArr, otherRides: tmpArr2});
         
    }
    catch(error)
    {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}


//Route for joining a ride
const joinRide = async (req, res) => {
    try{
        const {userId, rideId} = req.body;

        const user = await userModel.findById(userId);
        const ride = await ridesModel.findById(rideId);

        if (!user || !ride) {
            return res.status(404).json({ success: false, message: 'User or Ride not found' });
        }

        // Check if user already joined the ride
        const userAlreadyHasRide = user.ridesData.includes(rideId);
        const rideAlreadyHasUser = ride.riders.includes(userId);

        if (userAlreadyHasRide || rideAlreadyHasUser) {
            return res.json({ success: false, message: 'User already joined this ride' });
        }
         
        await userModel.findByIdAndUpdate(userId, {$push: {ridesData: rideId}}, {new: true});
        await ridesModel.findByIdAndUpdate(rideId, {$push: {riders: userId}}, {new: true});

        res.json({success:true, message:"Ride joined"});
         
    }
    catch(error)
    {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}


//Route for leaving a ride
const leaveRide = async (req, res) => {
     try{
         const {userId, rideId} = req.body;

        const user = await userModel.findById(userId);
        const ride = await ridesModel.findById(rideId);

        if (!user || !ride) {
            return res.status(404).json({ success: false, message: 'User or Ride not found' });
        }

        if (ride.riders.length == 1){
            await userModel.findByIdAndUpdate(userId, {$pull: {ridesData: rideId}}, {new:true});
            await ridesModel.findByIdAndDelete(rideId);
        }
        else{
            await ridesModel.findByIdAndUpdate(rideId, {$pull: {riders: userId}}, {new:true});
            await userModel.findByIdAndUpdate(userId, {$pull: {ridesData: rideId}}, {new:true});
        }


        res.json({success:true, message:"Ride Left Successfully"});
    }
    catch(error){
        console.log(error);
        res.json({success:false, message:error.message});
    }
}


export {addRide, deleteRide, getRideData, listAllRides, listUserRide, joinRide, leaveRide};
