import express from 'express';
import { upload } from '../middlewares/multer';
import { RegisterUser , LoginUser ,VerifyUser } from '../controllers/User';



const router = express.Router();



router.post('/register', upload.single('profileImage'), RegisterUser);
router.post('/login', LoginUser);
router.post('/verify', VerifyUser);



export default router