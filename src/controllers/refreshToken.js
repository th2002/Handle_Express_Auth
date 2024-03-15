import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import * as jwt_utils from "~/utils/jwt_utils";

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Token expired, no refresh token provided"
      );
    }

    const { userId } = req.body;

    await jwt_utils.verifyRefreshToken(refreshToken, userId);

    const accessToken = jwt_utils.generateAccessToken({ id: userId });

    return res
      .status(StatusCodes.OK)
      .send({ message: "Token refreshed", token: accessToken });
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, error.message));
  }
};

export default refreshToken;

