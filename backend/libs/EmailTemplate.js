export const Verification_Email_Template = `
<div style="
  max-width: 520px;
  margin: auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, Arial, sans-serif;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
">

  <!-- Header -->
  <div style="
    background: linear-gradient(135deg, #34B8FF, #A821EB);
    padding: 24px;
    text-align: center;
    color: #ffffff;
  ">
    <h1 style="margin: 0; font-size: 24px;">SnapWall</h1>
  </div>

  <!-- Body -->
  <div style="padding: 32px; text-align: center;">
    <h2 style="margin-bottom: 12px; color: #111;">
      Verify your email address
    </h2>

    <p style="color: #555; font-size: 15px; line-height: 1.6;">
      Use the OTP below to complete your verification.
      This code is valid for <b>5 minutes</b>.
    </p>

    <!-- OTP Box -->
    <div style="
      margin: 24px auto;
      display: inline-block;
      padding: 16px 32px;
      border-radius: 14px;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #111;
      background:
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #A821EB, #34B8FF) border-box;
      border: 2px solid transparent;
    ">
      {verificationToken}
    </div>

    <p style="font-size: 13px; color: #777;">
      If you didn’t request this, you can safely ignore this email.
    </p>
  </div>

  <!-- Footer -->
  <div style="
    padding: 16px;
    text-align: center;
    font-size: 12px;
    color: #999;
    background: #fafafa;
  ">
    © ${new Date().getFullYear()} SnapWall. All rights reserved.
  </div>

</div>
`;


export const Welcome_Email_Template = `
<div style="
  max-width: 520px;
  margin: auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, Arial, sans-serif;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
">

  <!-- Header -->
  <div style="
    background: linear-gradient(135deg, #A821EB, #34B8FF);
    padding: 28px;
    text-align: center;
    color: #ffffff;
  ">
    <h1 style="margin: 0; font-size: 24px;">
      Welcome to SnapWall 🎉
    </h1>
  </div>

  <!-- Body -->
  <div style="padding: 32px;">
    <h2 style="color: #111; margin-bottom: 12px;">
      Hi {name},
    </h2>

    <p style="color: #555; font-size: 15px; line-height: 1.7;">
      Your profile has been successfully created.
      You’re now part of a community where moments turn into memories.
    </p>

    <div style="
      margin: 24px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    ">
      <p style="margin: 0; font-size: 14px; color: #444;">
        📸 Share your memories<br/>
        🌍 Explore moments from others<br/>
        ✨ Build your digital wall
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 28px;">
      <a href="https://yourappdomain.com"
        style="
          display: inline-block;
          padding: 14px 32px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          text-decoration: none;
          background: linear-gradient(90deg, #34B8FF, #A821EB);
        ">
        Go to SnapWall
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="
    padding: 16px;
    text-align: center;
    font-size: 12px;
    color: #999;
    background: #fafafa;
  ">
    You received this email because you signed up for SnapWall.<br/>
    © ${new Date().getFullYear()} SnapWall
  </div>

</div>
`;
