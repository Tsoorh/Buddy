import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)


# service who use mailhog - activate the test check docker-compose mailhog service was set up
class EmailService:
    def __init__(self):
        self.smtp_server = "mailhog"
        self.smtp_port = 1025
        self.sender_email = "noreply@spearfreshfish"
        self.sender_password = ""

    async def send_reset_password_email(self, to_email: str, token: str):
        subject = "Password Reset Request"
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={token}"
        body = f"Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request a password reset, please ignore this email."
        await self.send_email(to_email, subject, body)

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        try:
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = to_email
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
            )

            logger.info(f"Email sent to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            # Fallback logging for development
            logger.info(
                f"--- EMAIL CONTENT ---\nTo: {to_email}\nSubject: {subject}\nBody: {body}\n---------------------"
            )
            return False
