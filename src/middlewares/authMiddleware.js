import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import * as jwt_utils from "~/utils/jwt_utils";
import { redis_utils } from "~/utils/redis_utils";

// Verify token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized access" });
    }

    // Verify token
    const decodedToken = jwt_utils.verifyToken(token);

    // Check blacklist
    const isTokenBlacklisted = await redis_utils.isTokenBlacklisted(
      decodedToken.id,
      token
    );

    if (isTokenBlacklisted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token blacklist");
    }

    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, error.message || "Unauthorized")
    ); // Pass error to next middleware
  }
};

export const localVariable = (req, res, next) => {
  req.app.locals = {
    OTP: "",
    resetSession: false,
  };

  next();
};

