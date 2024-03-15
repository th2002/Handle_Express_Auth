import { Router } from "express";
const authRoute = Router();

/** import authController and middlewares */
import * as authController from "~/controllers/authController";
import * as authMiddlewares from "~/middlewares/authMiddleware";
import refreshToken from "~/controllers/refreshToken";
import { registerMail } from "~/controllers/mailer";

/** POST Method */
authRoute.route("/register").post(authController.register);

authRoute.route("/registerMail").post(registerMail);

authRoute.route("/authenticate").post((req, res) => res.end());

authRoute.route("/login").post(authController.login);

authRoute
  .route("/logout")
  .post(authMiddlewares.verifyToken, authController.logout);

authRoute.route("/refreshToken").post(refreshToken);

/** GET Method */
authRoute
  .route("/generateOTP")
  .get(
    authMiddlewares.verifyToken,
    authMiddlewares.localVariable,
    authController.generateOTP
  ); // random OTP

authRoute
  .route("/verifyOTP")
  .get(authMiddlewares.verifyToken, authController.verifyOTP);

authRoute.route("/createResetSession").get(authController.createResetSession);

/** PUT Method */
authRoute
  .route("/resetPassword")
  .put(authMiddlewares.verifyToken, authController.resetPassword);

export default authRoute;

