const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const User = require('../models/User')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/checkAuth');
// const Video = require('../models/video')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
//   signup code..........
Router.post('/signup', async (req, res) => {
    try {
        // console.log(req.body)
        const users = await User.find({ email: req.body.email })
        if (users.length > 0) {
            return res.status(500).json({
                error: 'email already registered'
            })
        }
        const hashCode = await bcrypt.hash(req.body.password, 10)
        const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            channelName: req.body.channelName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashCode,
            logoUrl: uploadedImage.secure_url,
            logoId: uploadedImage.public_id
        })
        const user = await newUser.save();
        res.status(200).json({
            newUser: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})


// login code...........

Router.post('/login', async (req, res) => {
    try {

        console.log(req.body)
        const users = await User.find({ email: req.body.email })
        console.log(users)
        if (users.length == 0) {
            return res.json({
                err: "email not regisered..."
            })
        }
        const isValid = await bcrypt.compare(req.body.password, users[0].password)
        console.log(isValid)
        if (!isValid) {
            return res.status(500).json({
                err: "password not match"
            })
        }
        const token = jwt.sign({
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoId: users[0].logoId
        },
            'Aryman kumar 12345',
            {
                expiresIn: '365d'
            }
        )

        res.status(200).json({
            _id: users[0]._id,
            channelName: users[0].channelName,
            email: users[0].email,
            phone: users[0].phone,
            logoId: users[0].logoId,
            logoUrl: users[0].logoUrl,
            subscriber: users[0].subscriber,
            subscribedChannels: users[0].subscribedChannels,
            token: token
        })
    }
    catch (err) {
        console.log(err).json({
            error: "Somthing is wrong"
        })
    }
})


// ----------subscribe  api  --------------------
Router.put('/subscribe/:userBId', checkAuth, async (req, res) => {
    try {
        const userA = await jwt.verify(
            req.headers.authorization.split(" ")[1],
            'Aryman kumar 12345'
        )
        console.log(userA)
        const userB = await User.findById(req.params.userBId)
        console.log(userB)
        if (userB.subscribedBy.includes(userA._id)) {
            return res.status(500).json({
                err: 'already subscribed'
            })
        }
        // console.log("not subscribe")
        userB.subscribers += 1;
        userB.subscribedBy.push(userA._id)
        await userB.save()
        const userDetails = await User.findById(userA._id)
        userDetails.subscribedChannels.push(userB._id)
        await userDetails.save();
        res.status(200).json({
            msg: "subscribed...."
        })

    }
    catch (err) {
        res.status(500).json({
            err: 'err.msg'
        })
    }
})

// unsubscribe api
Router.put('/unsubscribe/:userBId', checkAuth, async (req, res) => {
    try {
        const userA = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
        const userB = await User.findById(req.params.userBId)
        console.log(userA)
        console.log(userB)

        if (userB.subscribedBy.includes(userA._id)) {
            userB.subscribers -= 1;
            userB.subscribedBy = userB.subscribedBy.filter(userId => userId.toString() != userA._id)
            await userB.save();
            const userADetails = await User.findById(userA._id)
            userADetails.subscribedChannels = userADetails.subscribedChannels.filter(userId => userId.toString() != userB._id)
            await userADetails.save();
            res.status(200).json({
                msg: 'unsubscribed......'
            })
        }
        else {
            res.status(500).json({
                err: 'you have not subscribed this channel'
            })
        }
    }
    catch (err) {
        res.status(500).json({
            err: 'unsubscribe function is not working'
        })
    }
})









module.exports = Router