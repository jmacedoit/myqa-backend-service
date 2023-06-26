
/*
 *  Email building blocks.
 */

export function email(body: string) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
  <!--<![endif]-->
  <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
  <!--[if (gte mso 9)|(IE)]>
  <style type="text/css">
    body {width: 600px;margin: 0 auto;}
    table {border-collapse: collapse;}
    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
    img {-ms-interpolation-mode: bicubic;}
  </style>
<![endif]-->
  <style type="text/css">
    body,
    p,
    div {
      font-family: arial, helvetica, sans-serif;
      font-size: 14px;
    }

    body {
      color: #000000;
    }

    body a {
      color: #1188E6;
      text-decoration: none;
    }

    p {
      margin: 0;
      padding: 0;
    }

    table.wrapper {
      width: 100% !important;
      table-layout: fixed;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -moz-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    img.max-width {
      max-width: 100% !important;
    }

    .column.of-2 {
      width: 50%;
    }

    .column.of-3 {
      width: 33.333%;
    }

    .column.of-4 {
      width: 25%;
    }

    ul ul ul ul {
      list-style-type: disc !important;
    }

    ol ol {
      list-style-type: lower-roman !important;
    }

    ol ol ol {
      list-style-type: lower-latin !important;
    }

    ol ol ol ol {
      list-style-type: decimal !important;
    }

    @media screen and (max-width:480px) {

      .preheader .rightColumnContent,
      .footer .rightColumnContent {
        text-align: left !important;
      }

      .preheader .rightColumnContent div,
      .preheader .rightColumnContent span,
      .footer .rightColumnContent div,
      .footer .rightColumnContent span {
        text-align: left !important;
      }

      .preheader .rightColumnContent,
      .preheader .leftColumnContent {
        font-size: 80% !important;
        padding: 5px 0;
      }

      table.wrapper-mobile {
        width: 100% !important;
        table-layout: fixed;
      }

      img.max-width {
        height: auto !important;
        max-width: 100% !important;
      }

      a.bulletproof-button {
        display: block !important;
        width: auto !important;
        font-size: 80%;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      .columns {
        width: 100% !important;
      }

      .column {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      .social-icon-column {
        display: inline-block !important;
      }
    }
  </style>
  <!--user entered Head Start--><!--End Head user entered-->
</head>
${body}
</html>
`;
}

export function body(content: string) {
  return `
<body>
  <center class="wrapper" data-link-color="#1188E6"
    data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#FFFFFF;">
    <div class="webkit">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
        <tr>
          <td valign="top" bgcolor="#FFFFFF" width="100%">
            <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0"
              border="0">
              <tr>
                <td width="100%">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <!--[if mso]>
    <center>
    <table><tr><td width="600">
  <![endif]-->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0"
                          style="width:100%; max-width:600px;" align="center">
                          <tr>
                            <td role="modules-container"
                              style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF"
                              width="100%" align="left">
                              <table class="module preheader preheader-hide" role="module" data-type="preheader"
                                border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                                <tr>
                                  <td role="module-content">
                                    <p></p>
                                  </td>
                                </tr>
                              </table>
                              <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%"
                                role="module" data-type="columns" style="padding:0px 0px 0px 0px;" bgcolor="#2b4547"
                                data-distribution="1">
                                <tbody>
                                  <tr role="module-content">
                                    <td height="100%" valign="top">
                                      <table width="580"
                                        style="width:580px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;"
                                        cellpadding="0" cellspacing="0" align="left" border="0" bgcolor=""
                                        class="column column-0">
                                        <tbody>
                                          <tr>
                                            <td style="padding:0px;margin:0px;border-spacing:0;">
                                              <table class="wrapper" role="module" data-type="image" border="0"
                                                cellpadding="0" cellspacing="0" width="100%"
                                                style="table-layout: fixed;"
                                                data-muid="41f644ed-3f89-41ee-ae37-ee3cf1eaa540">
                                                <tbody>
                                                  <tr>
                                                    <td
                                                      style="font-size:6px; line-height:10px; padding:16px 16px 16px 16px;"
                                                      valign="top" align="center"><img class="max-width" border="0"
                                                        style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:40% !important; width:40%; height:auto !important;"
                                                        width="232" alt="" data-proportionally-constrained="true"
                                                        data-responsive="true"
                                                        src="http://cdn.mcauto-images-production.sendgrid.net/a60d345109ffce47/c3d650f4-1b22-4fe5-ab21-6f21baceb36c/384x178.png">
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              ${content}
                          </tr>
                        </table>
                        <!--[if mso]>
                                  </td>
                                </tr>
                              </table>
                            </center>
                            <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
  `;
}

export function title(title: string) {
  return `
                             <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                cellspacing="0" width="100%" style="table-layout: fixed;"
                                data-muid="f970d35f-3588-478c-a358-b7c8af7aba14" data-mc-module-version="2019-10-22">
                                <tbody>
                                  <tr>
                                    <td
                                      style="padding:32px 32px 32px 32px; line-height:22px; text-align:inherit; background-color:#DDEEDB;"
                                      height="100%" valign="top" bgcolor="#DDEEDB" role="module-content">
                                      <div>
                                        <div style="font-family: inherit; text-align: left"><span
                                            style="color: #2b4547; font-size: 36px; font-family: helvetica, sans-serif"><strong>${title}</strong></span>
                                        </div>
                                        <div></div>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
    `;
}

export function text(text: string) {
  return `
                              <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                cellspacing="0" width="100%" style="table-layout: fixed;"
                                data-muid="4d4cdeda-2060-42da-98b7-f7212f10fe65" data-mc-module-version="2019-10-22">
                                <tbody>
                                  <tr>
                                    <td
                                      style="padding:0px 32px 32px 32px; line-height:22px; text-align:inherit; background-color:#DDEEDB;"
                                      height="100%" valign="top" bgcolor="#DDEEDB" role="module-content">
                                      <div>
                                        <div style="font-family: inherit; text-align: inherit"><span
                                            style="font-size: 18px; font-family: helvetica, sans-serif; color: #2b4547">${text}</span>
                                        </div>
                                        <div></div>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
`;
}

export function button(text: string, link: string, tracking: boolean = true) {
  return `
                              <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%"
                                role="module" data-type="columns" style="padding:0px 32px 32px 32px;" bgcolor="#ddeedb"
                                data-distribution="1">
                                <tbody>
                                  <tr role="module-content">
                                    <td height="100%" valign="top">
                                      <table width="536"
                                        style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;"
                                        cellpadding="0" cellspacing="0" align="left" border="0" bgcolor=""
                                        class="column column-0">
                                        <tbody>
                                          <tr>
                                            <td style="padding:0px;margin:0px;border-spacing:0;">
                                              <table border="0" cellpadding="0" cellspacing="0" class="module"
                                                data-role="module-button" data-type="button" role="module"
                                                style="table-layout:fixed;" width="100%"
                                                data-muid="dcecbf18-4b97-4a74-8639-7fc3e57d2811">
                                                <tbody>
                                                  <tr>
                                                    <td align="left" bgcolor="" class="outer-td"
                                                      style="padding:0px 0px 0px 0px;">
                                                      <table border="0" cellpadding="0" cellspacing="0"
                                                        class="wrapper-mobile" style="text-align:center;">
                                                        <tbody>
                                                          <tr>
                                                            <td align="center" bgcolor="#ff7360" class="inner-td"
                                                              style="border-radius:6px; font-size:16px; text-align:left; background-color:inherit;">
                                                              <a ${tracking ? '' : 'clicktracking=off'} href="${link}"
                                                                style="background-color:#ff7360; border:0px solid #333333; border-color:#333333; border-radius:50px; border-width:0px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;"
                                                                target="_blank">${text}</a></td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
`;
}
