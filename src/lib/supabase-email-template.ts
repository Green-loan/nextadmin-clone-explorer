
// This is the HTML template for email confirmation
// To be used in Supabase Email Templates settings

export const emailConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm your email for Green Finance</title>
  <style type="text/css">
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-body {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 40px 30px;
      margin-top: 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-circle {
      background-color: #22c55e;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .logo-icon {
      color: white;
      font-size: 30px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #16a34a;
      margin-top: 10px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .button {
      display: block;
      width: 200px;
      background-color: #22c55e;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      margin: 30px auto;
      text-align: center;
    }
    .button:hover {
      background-color: #16a34a;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .verification-code {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      text-align: center;
      font-size: 18px;
      letter-spacing: 2px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-body">
      <div class="logo">
        <div class="logo-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
        </div>
        <div class="logo-text">Green Finance</div>
      </div>
      
      <h1>Verify Your Email Address</h1>
      
      <p>Hello {{ .Email }},</p>
      
      <p>Thank you for creating an account with Green Finance. To complete your registration and access our financial services, please verify your email address by clicking the button below:</p>
      
      <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
      
      <p>If you didn't create an account, you can safely ignore this email.</p>
      
      <p>This link will expire in 24 hours. If you need assistance, please contact our support team.</p>
      
      <div class="footer">
        <p>&copy; 2023 Green Finance. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Instructions for setting up this template in Supabase:
// 1. Go to Supabase Dashboard > Authentication > Email Templates
// 2. Select "Confirmation" template
// 3. Paste this HTML into the template editor
// 4. Save changes
