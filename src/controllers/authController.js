import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

import UserModel from "~/models/User.model";
import ApiError from "~/utils/ApiError";
import { generateAccessToken, generateRefreshToken } from "~/utils/jwt_utils";
import { redis_utils } from "~/utils/redis_utils";
import otpGenerator from "otp-generator";
import { signUpBodyValidation } from "~/validations/authValidation";

/** POST:  http://localhost:3000/api/v1/auth/register
 * @body : {
  "username": "example123",
  "password": "admin123",
  "email": "example@gmail.com",
  "role": "customer"
}
 */
export const register = async (req, res, next) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { username, password, email, role } = req.body;

    // Check if user already exists
    const existUsername = await UserModel.findOne({ username });
    if (existUsername) {
      throw new ApiError(StatusCodes.CONFLICT, "Username already exists");
    }

    // Check if email already exists
    const existEmail = await UserModel.findOne({ email });
    if (existEmail) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
    }

    if (password) {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new UserModel({
        username,
        password: hashedPassword,
        email,
        fullname: "",
        phone_number: 0,
        role: role || "customer",
      });

      // Save user
      const result = await user.save();
      res
        .status(StatusCodes.CREATED)
        .send({ message: "User registered successfully" });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: "Password is required" });
    }
  } catch (error) {
    next(error);
  }
};

/** POST:  http://localhost:3000/api/v1/auth/login
 * @body : {
  "username": "example123",
  "password": "admin123",
}
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.find({ username });

    // Check if user exists
    if (user.length === 0)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user[0].password);

    // Check if password is correct
    if (!isMatch)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    // Generate JWT token
    const token = generateAccessToken({ id: user[0]._id });

    // Generate refresh token
    const refreshToken = generateRefreshToken({ id: user[0]._id });

    // Set refresh token in redis
    await redis_utils.setRefreshToken(user[0]._id, refreshToken.toString());

    // remove token in blacklist
    await redis_utils.delBlacklistToken(user[0]._id, token.toString());

    // set cookie
    res.cookie("x-refresh-token", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    });

    res.status(StatusCodes.OK).send({
      message: "User logged in successfully",
      username: user[0].username,
      role: user[0].role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/** POST:  http://localhost:3000/api/v1/auth/logout
 * @headers : {
  "Authorization": "Bearer <token>",
  "x-refresh-token": "<refreshToken>"
 }
 * @body : {
  "userId": "<userid>",
 */
export const logout = async (req, res) => {
  const { userId } = req.body;

  const accessToken = req.headers["authorization"].split("Bearer ")[1];

  // delete refresh token from redis
  await redis_utils.deleteRefreshToken(userId.toString());

  // set blacklist token in redis
  await redis_utils.setBlacklistToken(userId, accessToken.toString());

  res.status(StatusCodes.OK).send({ message: "User logged out successfully" });
};

/** GET:  http://localhost:3000/api/v1/auth/generateOTP */
export const generateOTP = (req, res) => {
  req.app.locals.OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  res.status(StatusCodes.CREATED).send({
    message: "OTP generated successfully",
    code: req.app.locals.OTP,
  });
};

/** GET:  http://localhost:3000/api/v1/auth/verifyOTP
 * @query : {
  "code": "123456"
 }
 */
export const verifyOTP = async (req, res) => {
  const { code } = req.query;

  if (parseInt(code) === parseInt(req.app.locals.OTP)) {
    req.app.locals.OTP = null; // reset the OTP
    req.app.locals.resetSession = true; // start session for reset password

    res.status(StatusCodes.OK).send({ message: "OTP verified successfully" });
  } else {
    res.status(StatusCodes.BAD_REQUEST).send({ error: "Invalid OTP" });
  }
};

// successful redirect user when OTP is valid
/** GET:  http://localhost:3000/api/v1/auth/createResetSession */
export const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    res.status(StatusCodes.OK).send({ message: "Session created" });
  }
  res.status(StatusCodes.BAD_REQUEST).send({ error: "Session expired" });
};

/** PUT:  http://localhost:3000/api/v1/auth/resetPassword
 * @body : {
  "username": "example123",
  "password": "admin123",
  "newPassword": "admin1234"
 }
 */
export const resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Reset session expired. Generate new OTP"
      );

    const { username, password, newPassword } = req.body;

    const user = await UserModel.find({ username });

    // Check if user exists
    if (user.length === 0)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user[0].password);

    // Check if password is correct
    if (!isMatch)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne(
      { username: user[0].username },
      { password: hashedNewPassword }
    );

    res.status(StatusCodes.OK).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send({ error: error.message });
  }
};

