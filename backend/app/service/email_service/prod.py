import aiosmtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL")
        self.sender_password = os.getenv("SENDER_PASSWORD")

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        if not self.sender_email or not self.sender_password:
            logger.warning("Email credentials are not set. Skipping email sending.")
            return False

        try:
            msg = MIMEMultipart()
            msg["From"] = self.sender_email
            msg["To"] = to_email
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "plain"))

            if self.smtp_port == 465:
                await aiosmtplib.send(
                    msg,
                    hostname=self.smtp_server,
                    port=self.smtp_port,
                    username=self.sender_email,
                    password=self.sender_password,
                    use_tls=True,
                )
            else:
                await aiosmtplib.send(
                    msg,
                    hostname=self.smtp_server,
                    port=self.smtp_port,
                    username=self.sender_email,
                    password=self.sender_password,
                    start_tls=True,
                )

            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    async def send_reset_password_email(self, to_email: str, token: str):
        subject = "Password Reset Request"
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={token}"
        body = f"Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request a password reset, please ignore this email."

        await self.send_email(to_email, subject, body)
