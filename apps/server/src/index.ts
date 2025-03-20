import express from 'express'
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import { v2 as cloudinary  } from 'cloudinary';

import UserRoute from './routes/UserRoute' 

const app = express()

dotenv.config({
  path : "./.env"
})

export const resend = new Resend(process.env.RESEND_API_KEY as string);

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
  api_key: process.env.CLOUDINARY_API_KEY as string, 
  api_secret: process.env.CLOUDINARY_API_SECRET as string
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/v1/user', UserRoute)




app.listen(3002, () => {
  console.log('Server is running on port 3002')
})