import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transport = {
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d8a26d1c7232de",
      pass: "ae86e20bd2e487",
    },
  };

  const transporter = nodemailer.createTransport(transport);

  const message = {
    from: `My Ecom, noreplyecom@gmail.com`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};
