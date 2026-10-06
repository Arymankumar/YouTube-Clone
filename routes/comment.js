
const express = require('express')
const Router = express.Router()
const Comment = require('../models/Comment')
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')




//   ------------new comment -----------
Router.post('/new-comment/:videoId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
        // console.log(verifiedUser)
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId,
            videoId: req.params.videoId,
            userId: verifiedUser._id,
            commentText: req.body.commentText
        })

        const comment = await newComment.save();
        res.status(200).json({
            newComment: comment
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            err: 'new comments are not working...'
        })
    }

})

// -------------get all comments by their id-----------
Router.get('/:videoId', async (req, res) => {
    try {
        const comments = await Comment.find({ videoId: req.params.videoId }).populate('userId', 'channelName logoUrl')
        res.status(200).json({
            commentList: comments
        })
    }
    catch (err) {

        res.status(500).json({
            err: 'problem in code of getting all comments....'
        })
    }
})

// --------update comment -----------
Router.put('/:commentId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
        console.log(verifiedUser)
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment)

        if (comment.userId != verifiedUser._id) {
            return res.status(500).json({
                error: 'invalid user'
            })
        }
        // edit code
        comment.commentText = req.body.commentText;
        const updatedComment = await comment.save()
        res.status(200).json({
            updatedComment: updatedComment
        })
    }
    catch (err) {
        res.status(500).json({
            err: 'not edit function working'
        })
    }
})

// --------delete comment -----------
Router.delete('/:commentId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'Aryman kumar 12345')
        console.log(verifiedUser)
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment)

        if (comment.userId != verifiedUser._id) {
            return res.status(500).json({
                error: 'invalid user'
            })
        }
        // delete code
        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({
            deletedComment: 'deletedComment successfull'
        })
    }
    catch (err) {
        res.status(500).json({
            err: 'not delete function working'
        })
    }
})









module.exports = Router;