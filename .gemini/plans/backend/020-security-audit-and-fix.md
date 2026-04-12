# Plan: Security Audit and Hardening (Revised)

## Goal
Hardened the application against common security threats such as brute-force attacks, DoS, and data exposure, while ensuring high performance in production.

## Proposed Fixes

### 1. Implement Rate Limiting (Best Practice)
- **Solution**: Integrate `slowapi` (the standard rate-limiting library for FastAPI).
- **Action**: Add decorators to sensitive authentication routes to prevent abuse.
- **Targets**:
    - `login`: 5 requests/minute per IP.
    - `register`: 3 requests/hour per IP.
    - `forgot-password`: 3 requests/hour per IP.

### 2. Asynchronous Email Sending
- **Solution**: Refactor email services to be non-blocking using `aiosmtplib` (recommended for async FastAPI) or `run_in_executor`.
- **Action**: This ensures that sending an email doesn't hang the entire server for other users.

### 3. Log Hardening & Cleanup
- **Action**: Replace all debug `print()` statements with structured logging using the existing `app_logger`.
- **Action**: Ensure sensitive data (tokens, passwords) is never logged.

### 4. Dynamic CORS Configuration
- **Action**: Refactor `app/main.py` to use a `CORS_ALLOWED_ORIGINS` environment variable instead of hardcoded strings.

## Recommended .env Updates
*I will NOT modify your .env file. Please add/update the following values yourself for better security:*

```env
# Rate Limiting (optional toggle if we implement it)
RATELIMIT_ENABLED=true

# CORS Configuration (Example: http://localhost:5173,https://yourdomain.com)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Note: Please ensure your JWT_SECRET and SENDER_PASSWORD are long, complex, and unique.
```

## Steps to Execute

1.  **Dependencies**: Add `slowapi` and `aiosmtplib` to `backend/requirements.txt`.
2.  **Rate Limiter**: Initialize in `app/main.py` and apply to `auth/routes.py`.
3.  **Async Email**: Update `service/email_service/prod.py` and `dev.py`.
4.  **Logging**: Systematic replacement of `print` with `app_logger`.
5.  **CORS**: Update `app/main.py` to read from settings.

## Approval
Does this revised plan meet your expectations? If so, I will begin with the dependency updates.