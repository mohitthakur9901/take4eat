import express from 'express';
import { upload } from '../middlewares/multer';
import { RegisterUser } from '../controllers/User';



const router = express.Router();



router.post('/register', upload.single('profileImage'), RegisterUser);


export default router