export const generateHtmlTemplate = (title: string, bodyHtml: string, platformTag: string = "Sport2GO — sports organization platform.") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f8;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .header {
      background: linear-gradient(to right, #F0CA68, #EAA145);
      padding: 24px;
      text-align: center;
    }
    .logo {
      height: 32px;
      max-width: 100%;
      object-fit: contain;
      vertical-align: middle;
      display: inline-block;
      margin-right: 8px;
    }
    .logo-text {
      color: white;
      font-size: 24px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      vertical-align: middle;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    .content {
      padding: 40px;
      text-align: center;
      color: #333333;
    }
    .footer {
      background-color: #31574d;
      padding: 24px;
      text-align: center;
      color: #a3b8b1;
      font-size: 13px;
    }
    .footer a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <img src="https://www.sport2go.app/image/logo.svg" alt="Logo" width="32" height="32" style="width: 32px; height: 32px; vertical-align: middle; filter: brightness(0) invert(1);" />
        <div class="logo-text">
          <span style="font-weight: 400">SPORT</span><span>2GO</span>
        </div>
      </div>
      
      <!-- Body -->
      <div class="content">
        ${bodyHtml}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 4px 0;">${platformTag}</p>
        <p style="margin: 0;"><a href="mailto:info@sport2go.si">info@sport2go.si</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
