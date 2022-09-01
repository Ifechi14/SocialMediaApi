const express= require('express');
const router= express.Router();
const userController= require('./../controllers/userControllers');
const authController = require('./../controllers/authControllers');

router
    .route('/:id')
    .put(authController.protect, userController.update)
    .get(userController.getUser)
    .delete(authController.protect,authController.restrictTo('admin'),userController.delete);
router
    .route('/')
    .get(userController.getAllUsers);
router
    .route('/updateMe')
    .patch(authController.protect, userController.updateMe)

//follow a user
router.put('/:id/follow',authController.protect, userController.follow);
//unfollow a users
router.put('/:id/unfollow', authController.protect, userController.unfollow);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports= router;