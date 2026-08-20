const express = require('express')
const Router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const jwt = require('jsonwebtoken');
const { resource } = require('../app');
const cloudinary = require('cloudinary').v2
const Video = require('../models/Video')
const mongoose = require('mongoose')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
//--------->uploading video <---------------

Router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const user = await jwt.verify(token, 'Aryman kumar 12345')

        //    console.log(user)
        //    console.log(req.body)
        //    console.log(req.files.video)
        //    console.log(req.files.thumbnail)
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, { resource_type: 'video' })
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)

        const newVideo = new Video({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            user_id: user._id,
            videoUrl: uploadedVideo.secure_url,
            videoId: uploadedVideo.public_id,
            thumbnailUrl: uploadedThumbnail.secure_url,
            thumbnailId: uploadedThumbnail.public_id,
            category: req.body.category,
            tags: req.body.tags.split(",")
        })
        const newUploadedVideoData = await newVideo.save()
        res.status(200).json({
            newVideo: newUploadedVideoData
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

//  -----------update video detais-------------
Router.put('/:videoId', authMiddleware, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
        const video = await Video.findById(req.params.videoId)
        console.log(video)
        if (video.user_id == verifiedUser._id) {
            // update video details
            if (req.files) {
                await cloudinary.uploader.destroy(video.thumbnailId)
                const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    tags: req.body.tags.split(","),
                    thumbnailUrl: updatedThumbnail.secure_url,
                    thumbnailId: updatedThumbnail.public_id,
                }
                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { returnDocument: 'after' })
                res.status(200).json({
                    updatedVideo: updatedVideoDetail
                })
            }
            else {
                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    tags: req.body.tags.split(","),

                }
                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { returnDocument: 'after' })
                res.status(200).json({
                    updatedVideo: updatedVideoDetail
                })

            }
        }
        else {
            return res.status(500).json({
                error: 'not allow to update'
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

//------------delete video--------------

Router.delete('/:videoId', authMiddleware, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
        console.log(verifiedUser)
        const video = await Video.findById(req.params.videoId,{resource_type:'video'})
        if (video.user_id == verifiedUser._id) {
            // delete video and data and thumbnail
            await cloudinary.uploader.destroy(video.videoId)
            await cloudinary.uploader.destroy(video.thumbnailId)
            const deleteResponse = await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({
                deleteResponse: deleteResponse
            })

        }
        else {
            return res.status(500).json({
                error: 'not able to delete '
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// ------------like and dislike-----------

// Router.put('/like/:videoId',authMiddleware,async(req,res)=>{
//     try
//     {
//         const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
//         console.log(verifiedUser)
//     }
//     catch(err)
//     {
//         console.log(err)
//         res.status(500).json({
//             error:err
//         })
//     }
// })



module.exports = Router