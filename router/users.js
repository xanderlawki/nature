
 const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const router = express.Router()
router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)
router.get('/me', authController.protect, userController.getMe, userController.getUser)
router.patch('/updateMe', authController.protect, userController.updateMe)
router.delete('/deleteMe', authController.protect, userController.deleteMe)
router.post('/forgotPassword', authController.ForgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.route('/').get(userController.getAllUsers).post(userController.createUser)
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(authController.protect,userController.deleteUser, authController.restrictTo('admin', 'lead-guide'))




module.exports = router