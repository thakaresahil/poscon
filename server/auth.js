import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

const secretKey = process.env.SECRET_KEY;

function generateToken (user) {
    return jwt.sign({id: user.id}, secretKey, {expiresIn: '30d'});
};

function verifyToken  (token) {
    try{
        return jwt.verify(token, secretKey);
    }
    catch(err){
        return null;
    }
}

export{generateToken, verifyToken};