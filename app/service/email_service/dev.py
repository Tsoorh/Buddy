import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", "1025"))
        self.sender_email = os.getenv("SENDER_EMAIL", "noreply@spear.app")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")

    async def send_reset_password_email(self, to_email: str, token: str):
        subject = "Password Reset Request"
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={token}"
        body = f"Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request a password reset, please ignore this email."
        await self.send_email(to_email, subject, body)

    async def send_email(self, to_email: str, subject: str, body: str):
        try:
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = to_email
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            use_tls = self.smtp_port == 465
            start_tls = not use_tls and self.smtp_port == 587

            async with aiosmtplib.SMTP(
                hostname=self.smtp_server,
                port=self.smtp_port,
                use_tls=use_tls,
                start_tls=start_tls,
            ) as server:
                if self.sender_password:
                    await server.login(self.sender_email, self.sender_password)
                await server.send_message(message)

            logger.info(f"Email sent to {to_email}")

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            # Fallback logging for development
            logger.info(
                f"--- EMAIL CONTENT ---\nTo: {to_email}\nSubject: {subject}\nBody: {body}\n---------------------"
            )
