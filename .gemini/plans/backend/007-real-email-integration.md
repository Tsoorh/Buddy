# Plan: Real Email Integration

## Goal
Enable the application to send emails to real recipients using an external SMTP provider (like Gmail, SendGrid, etc.), replacing or supplementing the local MailHog setup.

## Status
Implemented

## Implementation Steps

- [x] **1. Configuration**:
    - Identify necessary environment variables: `SMTP_SERVER`, `SMTP_PORT`, `SENDER_EMAIL`, `SENDER_PASSWORD`.
    - Ensure the application can switch between MailHog (dev) and Real SMTP (prod) via these variables.

- [x] **2. Verification Script**:
    - Create a script `app/test_email.py` that attempts to connect to the SMTP server and send a test email to a provided address.
    - This allows verifying credentials and TLS/STARTTLS settings without running the full application flow.

- [x] **3. Documentation**:
    - Document the setup process for common providers (e.g., Gmail App Passwords) in the plan or a README.

## Questions
1. Do you have a specific SMTP provider in mind (e.g., Gmail, AWS SES, SendGrid)?Gmail, i already set the mail to send from with 16chars password in .env file under SENDER_EMAIL,SENDER_PASSWORD.
2. Do you want to keep MailHog in the `docker-compose.yml` for local development?No need for now - you can put in note - # . 

## Setup Documentation (Gmail)
1.  Go to your Google Account settings.
2.  Enable 2-Step Verification.
3.  Search for "App passwords".
4.  Create a new App password for "Mail" and your device.
5.  Copy the 16-character password.
6.  Update your `.env` file:
    ```env
    SMTP_SERVER=smtp.gmail.com
    SMTP_PORT=587
    SENDER_EMAIL=your_email@gmail.com
    SENDER_PASSWORD=your_16_char_app_password
    ```
