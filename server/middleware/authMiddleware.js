import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    // 2. Remove "Bearer "
    const actualToken = token.split(" ")[1];

    // 3. Verify token
    const decoded = jwt.verify(actualToken, "secretkey");

    // 4. Attach user to request
    req.user = decoded;

    next(); // go to next function
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
