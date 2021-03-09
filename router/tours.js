const express = require('express')
const authController = require('../controllers/authController')
const tourController = require('../controllers/tourController')
const ReviewRoutes = require('.././router/reviews')
const router = express.Router(':tourId/reviews', ReviewRoutes)

router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)
// router.route('/tour-stats').get(tourController.getTourstats)
router.route('/top-5-cheap').get(tourController.aliasTopFours, tourController.getAllTours)
router.route('/').get(authController.protect, tourController.getAllTours).post(authController.protect, authController.restrictTo('admin'), tourController.createTour)
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour)


module.exports = router