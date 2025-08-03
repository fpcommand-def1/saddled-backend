import express from 'express';
import upload from '../middleware/multer.js';
import {addRide, deleteRide, getRideData, listAllRides, listUserRide, joinRide, leaveRide} from '../controllers/rideController.js';
import authUser from '../middleware/auth.js';

const rideRouter = express.Router();
rideRouter.post('/add', upload.fields([{name:'image1', maxCount:1}]), addRide);
rideRouter.get('/list-all', listAllRides);
rideRouter.post('/delete', deleteRide);
rideRouter.post('/get-ride-data', getRideData);
rideRouter.post('/list-user-rides', listUserRide);
rideRouter.post('/join-ride', joinRide);
rideRouter.post('/leave-ride', leaveRide);



export default rideRouter;