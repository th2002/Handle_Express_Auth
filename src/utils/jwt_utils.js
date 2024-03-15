import jwt from "jsonwebtoken";
import ApiError from "./ApiError";
import { env } from "~/config/environment";
import { redis_utils } from "./redis_utils";
import { StatusCodes } from "http-status-codes";

const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30m" });
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const generateRefreshToken = (payload) => {
  const refreshTokenSecret = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  return refreshTokenSecret;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, error.message);
  }
};

const verifyRefreshToken = async (refreshToken, userId) => {
  try {
    const refreshToken_redis = await redis_utils.getRefreshToken(userId);

    // check if token is not in redis and compare with provided refreshToken
    if (!refreshToken_redis || refreshToken_redis !== refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    // check if token is valid
    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);

    return decoded;
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, error.message);
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};

