const express=require('express')
const app=express();
const mongoose=require('mongoose')
require('dotenv').config()
const userRoute=require('../Backend/routes/user')
const videoRoute=require('../Backend/routes/video')
const commentRoute=require('../Backend/routes/comment')

const bodyParser=require('body-parser')
const fileUpload=require('express-fileupload')
const jwt=require('jsonwebtoken')

// app.get('/test',(req,res)=>{
//     res.status(200).json({
//         msg:'testing api'
//     })
// })
// console.log(process.env.MONGO_URI); 
// mongoose.connect(process.env.MONGO_URI)
// .then(res=>{
//     console.log('connected with db...')
// })
// .catch(err=>{
//     console.log(err)
// })

const connectWithDatabase = async()=> {
    try{
        
        mongoose.connect(process.env.MONGO_URI);
        console.log('connected with database.....')
    }
    catch(err)
    {
        console.log(err)
    }
}
connectWithDatabase();
app.use(bodyParser.json())
app.use(fileUpload({
    useTempFiles:true,
    // tempFileDir:',/tmp/'

}));

app.use('/user',userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)






module.exports=app;