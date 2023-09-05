const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// function to generate reset password link and token.
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email from req body
    const email = req.body.email;

    // check user existence for this email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }

    // generate token
    const token = crypto.randomUUID();

    // update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );
    // create url
    const url = `http://localhost:3000/update-password/${token}`;
    // send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );
    // return response
    return res.json({
      success: true,
      message:
        "Email sent successfully,Please check your Email and change your password",
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    });
  }
};

// function to reset the password.

exports.resetPassword = async (req, res) => {
 try {
     // data fetch
  const {password,confirmPassword,token}=req.body;

  // validation
  if(password !== confirmPassword){
    return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
  }

  // get userdetails from db using token
  const userDetails = await User.findOne({ token: token })
  
  // if no entry is found -- 2 possibilites : 1. invalid token 2. token time has expired.
  // invalid token
  if (!userDetails) {
    return res.json({
      success: false,
      message: "Token is Invalid",
    })
  }
  // token time check
  if (userDetails.resetPasswordExpires < Date.now()) {
    return res.status(403).json({
      success: false,
      message: `Token is Expired, Please Regenerate Your Token`,
    })
  }

  // hash password
  const encryptedPassword = await bcrypt.hash(password, 10);

  // password update
  await User.findOneAndUpdate(
    { token: token },
    { password: encryptedPassword },
    { new: true }
  )
  
  // return response
  res.json({
    success: true,
    message: `Password Reset Successful`,
  })
 } catch (error) {
    return res.json({
        error: error.message,
        success: false,
        message: `Some Error in Updating the Password`,
      })
 }
};
