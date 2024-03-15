import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { env } from "~/config/environment";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";

let nodeConfig = {
  service: "gmail",
  auth: {
    user: env.EMAIL, // generate by ethereal.email
    pass: env.PASSWORD, // generate by ethereal.password
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
    logo: "https://mailgen.js/img/logo.png",
  },
});

/** POST : http://localhost:3000/api/v1/auth/registerMail
 * @body : {
  "username": "example123",
  "userEmail": "example@gmail.com",
  "text": "",
  "subject": "",
  "otp": ""
 }
 */
export const registerMail = async (req, res) => {
  try {
    const { username, userEmail, text, subject, otp } = req.body;

    // body of the email
    var email = {
      body: {
        name: username,
        intro: text || `Welcome to Event App! Your OTP is ${otp}.`,
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    var emailBody = MailGenerator.generate(email);

    let message = {
      from: env.EMAIL,
      to: userEmail,
      subject: subject || "OTP for Event App!",
      html: emailBody,
    };

    await transporter.sendMail(message);

    return res
      .status(StatusCodes.OK)
      .send({ message: "Email sent successfully" });
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

