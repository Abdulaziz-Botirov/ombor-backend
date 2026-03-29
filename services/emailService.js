import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export async function sendVerificationEmail(to, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Verification code for ${to}: ${code}`)
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Ombor Fullstack - Verification Code',
    text: `Sizning tasdiqlash kodingiz: ${code}`,
  })
}
