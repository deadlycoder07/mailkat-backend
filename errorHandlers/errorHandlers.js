const notFound=(req,res,next)=>{
    const error= new Error(`Error 404: Not found ${req.originalUrl}`);
    res.statusCode= 404;
    next(error)
};

const errorHandler =(error,req,res,next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    if(statusCode!=404)
        error= new Error(`Something went wrong!`)
    
    res.status(statusCode);
    console.log(error)
    if(process.env.NODE_ENV==='development')
        res.json({
            message:error.message,
            stack:error.stack,
        })
    else
        res.render("error",{"message":error.message, "statusCode":res.statusCode})
};

module.exports = {
    notFound,
    errorHandler,
}