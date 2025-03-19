import express from 'express'
import cors from "cors";


import UserRoute from './routes/UserRoute' 

const app = express()


app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/v1/user', UserRoute)




app.listen(3002, () => {
  console.log('Server is running on port 3002')
})