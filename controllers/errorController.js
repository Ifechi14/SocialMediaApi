// const sendErrorDev= (err,res)=>{
//     res.status(err.statusCode).json({
//         status: err.status,
//         err: err,
//         message: err.message,
//         stack: err.stack
//     });
// }
// const sendErrorProd= (err,res)=>{
//     //operational, trusted error
//     if(err.isOperational){
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message,
//         });
//     //programming or other unknown err  
//     }else{
//         //log error
//         console.error('ERROR ', err);
//         //send generic message
//         res.status(500).json({
//             status: 'erros',
//             message:'Something went wrong!'
//         })
//     }
    
// }
module.exports= (err, req, res, next)=>{
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    res.status(statusCode).json({
        status: err.status,
        message: err.message
    })

    // if(process.env.NODE_ENV === 'development'){
    //     sendErrorDev(err,res);
    // }else if(process.env.NODE_ENV==='production') {
    //     sendErrorProd(err,res);
    // }
}