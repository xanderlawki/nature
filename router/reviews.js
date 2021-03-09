const express = require('express')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')
const router = express.Router({mergeParams: true})


router.route('/').get(reviewController.getAllReviews)
router.route('/').post(authController.protect,authController.restrictTo('user'),reviewController.setTourUserIds, reviewController.createReview)
router.route('/:id').get(reviewController.getReview).patch(reviewController.updateReview).delete(reviewController.deleteReview)

module.exports = router