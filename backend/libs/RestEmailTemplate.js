export const Reset_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #ddd; }
          .header { background-color: #ff4444; color: white; padding: 20px; text-align: center; font-size: 26px; font-weight: bold; }
          .content { padding: 25px; color: #333; line-height: 1.8; }
          .reset-code { display: block; margin: 20px 0; font-size: 22px; color: #ff4444; background: #ffebee; border: 1px dashed #ff4444; padding: 10px; text-align: center; border-radius: 5px; font-weight: bold; letter-spacing: 2px; }
          .footer { background-color: #f4f4f4; padding: 15px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #ddd; }
          p { margin: 0 0 15px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Reset Your Password</div>
          <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Please use the code below to proceed:</p>
              <span class="reset-code">{resetToken}</span>
              <p>This code will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support.</p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} Study Buddy. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;