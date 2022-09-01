const express= require('express');
const router= express.Router();
const postContoller= require('./../controllers/postControllers');

router
    .route('/:id')
    .get(postContoller.getPost)
    .put(postContoller.update)
    .delete(postContoller.delete);

    
//create a post
router.post('/',postContoller.create);
///like a post / dislike a post
router.put('/:id/like', postContoller.like);
//get a timeline post
router.get('/timeline/all', postContoller.timeline);



module.exports= router;
