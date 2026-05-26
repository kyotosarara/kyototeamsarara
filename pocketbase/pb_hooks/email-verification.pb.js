/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: e.record.get("email") }],
    subject: "Welcome! Please verify your email",
    html: "<h1>Welcome to our community!</h1><p>Hi " + e.record.get("name") + ",</p><p>Thank you for signing up! Please verify your email address to complete your registration.</p><p><a href='" + $app.settings().meta.appUrl + "/auth/verify?token=" + e.record.get("tokenKey") + "'>Verify Email</a></p><p>If you did not create this account, please ignore this email.</p>"
  });
  $app.newMailClient().send(message);
  e.next();
}, "users");