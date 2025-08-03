import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/userRoute.js'
import rideRouter from './routes/rideRoute.js'


//App Config

const app = express()
const port = process.env.PORT || 4000
connectDB()

//Middlewares

app.use(cookieParser());
app.use(cors({origin: "https://saddled.vercel.app", credentials: true, }))
//app.use(cors({origin: "http://localhost:4321", credentials: true, }))
app.use(express.json())

//API Endpoints

app.use('/api/user', userRouter);
app.use('/api/rides', rideRouter);



app.get('/', (req, res)=>{
    res.send("API Working")
    })

app.listen(port, ()=>console.log('Server Started on PORT : ' + port))