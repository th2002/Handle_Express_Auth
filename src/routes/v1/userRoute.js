import { Router } from "express";
const userRoute = Router();

/** import userController */
import * as userController from "~/controllers/userController";

/** GET Method */
userRoute.route("/:username").get(userController.getUser);
userRoute.route("/updateUser").put(userController.updateUser); // update the user profile

export default userRoute;

