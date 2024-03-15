import { StatusCodes } from "http-status-codes";
import { env } from "~/config/environment";

export const errorHandlingMiddleware = (err, req, res, next) => {
  // By default, the code will be 500 INTERNAL_SERVER_ERROR
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  // Create responseError to control what to return
  // The { statusCode, message, stack } are passed into Middleware
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode], // If there is an error without a message, get the standard ReasonPhrases according to the Status Code
    stack: err.stack,
  };

  // Only when the environment is DEV will the Stack Trace be returned for easier debugging
  if (env.BUILD_MODE !== "dev") delete responseError.stack;

  res.status(responseError.statusCode).json(responseError);
};

