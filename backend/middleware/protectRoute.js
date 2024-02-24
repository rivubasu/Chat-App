import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; //for getting cookie from req using cookie-parser

    if (!token) {
      return res.status(401).send({ error: "Unauthorized-No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //checking the validity of token by passing secret key

    if (!decoded) {
      return res.status(401).send({ error: "Unauthorized-Invalid Token" });
    }

    const user = await User.findById(decoded.UserId).select("-password"); //checking the user is exist or not in db and removing the  password
    if (!user) {
      return res.status(401).send("Sorry! User does't exists.");
    }

    req.user = user; //saving the user in request so that it can be accessed anywhere within this route

    next();
  } catch (error) {
    console.log("Error in Protect Route Middleware", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default protectRoute;
