const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

if(req.session?.user){
req.user = req.session.user;
return next();
}

const authHeader = req.headers.authorization;
const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

if(!token){
return res.status(401).json({message:"Access denied"});
}

try{

const decoded = jwt.verify(token,"secretkey");

req.user = decoded;

next();

}catch(err){

res.status(400).json({message:"Invalid token"});

}

};
