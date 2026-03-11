import os
import sys

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.service.email_service.index import get_email_service

# from app.service.email_service.prod import EmailService


def main():
    print("Starting email test...")

    # Check for environment variables
    sender = os.getenv("SENDER_EMAIL")
    password = os.getenv("SENDER_PASSWORD")

    if not sender or not password:
        print(
            "Error: SENDER_EMAIL or SENDER_PASSWORD not found in environment variables."
        )
        print(
            "Make sure you are running this inside the container or have .env loaded."
        )
        return

    service = get_email_service()
    # Send to self for verification
    recipient = "tsoor.hartov@gmail.com"
    subject = "Test Email Integration"
    body = (
        "Hello! This is a test email from the Buddy application real email integration."
    )

    print(f"Sending email from {sender} to {recipient}...")

    if service.send_email(recipient, subject, body):
        print("Test PASSED: Email sent successfully.")
    else:
        print("Test FAILED: Could not send email. Check logs for details.")


if __name__ == "__main__":
    main()
