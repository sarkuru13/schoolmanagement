const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req,res)=>{

const {email,password} = req.body;

db.query(
"SELECT * FROM users WHERE email=?",
[email],
async (err,result)=>{

if(result.length === 0){
return res.status(404).json({message:"User not found"});
}

const user = result[0];

const valid = await bcrypt.compare(password,user.password);

if(!valid){
return res.status(401).json({message:"Wrong password"});
}

const token = jwt.sign(
{id:user.id,role:user.role},
"secretkey",
{expiresIn:"1d"}
);

res.json({
token,
role:user.role
});

});

};


exports.registerAdmin = async (req,res)=>{

const {name,email,password} = req.body;

const hash = await bcrypt.hash(password,10);

db.query(
"INSERT INTO users(name,email,password,role) VALUES(?,?,?,'admin')",
[name,email,hash],
(err)=>{

if(err){
return res.status(500).json(err);
}

res.json({message:"Admin created"});

}
);

};