import logging
import base64
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import aiosmtplib
from app.config import settings

logger = logging.getLogger("mail_service")

async def send_email(to_email: str, subject: str, html_content: str):
    # If credentials are not configured, log to console for development ease
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"\n========================================\n"
              f"[SMTP SIMULATION LOG]\n"
              f"To: {to_email}\n"
              f"Subject: {subject}\n"
              f"Content:\n{html_content}\n"
              f"========================================\n")
        return True

    try:
        # Using "related" multipart type enables embedding inline attachments (CIDs)
        message = MIMEMultipart("related")
        message["From"] = settings.EMAIL_FROM
        message["To"] = to_email
        message["Subject"] = subject
        
        # Alternative container for HTML
        msg_alt = MIMEMultipart("alternative")
        message.attach(msg_alt)
        
        part = MIMEText(html_content, "html")
        msg_alt.attach(part)
        
        # Attach the brand logo as an inline attachment
        logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../nexus_logo.jpg'))
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as image_file:
                img_data = image_file.read()
            msg_image = MIMEImage(img_data)
            msg_image.add_header('Content-ID', '<nexus_logo>')
            message.attach(msg_image)
            
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True if settings.SMTP_PORT == 587 else False,
            use_tls=True if settings.SMTP_PORT == 465 else False
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        # Log to console as fallback during development
        print(f"\n[FALLBACK LOG due to SMTP error: {e}]\n"
              f"To: {to_email}\n"
              f"Subject: {subject}\n"
              f"Content:\n{html_content}\n")
        return False

async def send_otp_email(to_email: str, otp: str):
    subject = "Verify Your Email - SGBAU Nexus AI"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .email-container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0c0b10;
                color: #f3f4f6;
                padding: 40px 20px;
                text-align: center;
                border-radius: 12px;
                max-width: 600px;
                margin: auto;
                border: 1px solid #1f2937;
            }}
            .header {{
                font-size: 24px;
                font-weight: 800;
                background: linear-gradient(90deg, #00f2fe, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 20px;
            }}
            .otp-box {{
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                color: #00f2fe;
                background: rgba(0, 242, 254, 0.1);
                border: 1px dashed #00f2fe;
                padding: 15px 30px;
                display: inline-block;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .footer {{
                font-size: 12px;
                color: #9ca3af;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="cid:nexus_logo" alt="SGBAU Nexus AI Logo" style="max-width: 110px; border-radius: 50%; box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);" />
            </div>
            <div class="header">SGBAU Nexus AI</div>
            <p>Hello,</p>
            <p>Welcome to SGBAU Nexus AI Portal. Please use the verification code below to complete your registration:</p>
            <div class="otp-box">{otp}</div>
            <p>This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
            <div class="footer">
                © 2026 Sant Gadge Baba Amravati University Information helpdesk. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, html_content)

async def send_reset_password_email(to_email: str, otp: str):
    subject = "Reset Your Password - SGBAU Nexus AI"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .email-container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0c0b10;
                color: #f3f4f6;
                padding: 40px 20px;
                text-align: center;
                border-radius: 12px;
                max-width: 600px;
                margin: auto;
                border: 1px solid #1f2937;
            }}
            .header {{
                font-size: 24px;
                font-weight: 800;
                background: linear-gradient(90deg, #ff007f, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 20px;
            }}
            .otp-box {{
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                color: #ff007f;
                background: rgba(255, 0, 127, 0.1);
                border: 1px dashed #ff007f;
                padding: 15px 30px;
                display: inline-block;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .btn-reset {{
                background: linear-gradient(135deg, #ff007f, #8b5cf6);
                color: #ffffff !important;
                text-decoration: none;
                font-weight: bold;
                padding: 12px 30px;
                border-radius: 8px;
                display: inline-block;
                margin-top: 15px;
                box-shadow: 0 4px 15px rgba(255, 0, 127, 0.3);
            }}
            .footer {{
                font-size: 12px;
                color: #9ca3af;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="cid:nexus_logo" alt="SGBAU Nexus AI Logo" style="max-width: 110px; border-radius: 50%; box-shadow: 0 4px 15px rgba(255, 0, 127, 0.2);" />
            </div>
            <div class="header">SGBAU Nexus AI</div>
            <p>Hello,</p>
            <p>You requested to reset your password. Use the verification OTP below to complete the reset process:</p>
            <div class="otp-box">{otp}</div>
            <p>Alternatively, click the link below to enter your new password:</p>
            <a href="http://localhost:8000/portal/reset-password?email={to_email}&otp={otp}" class="btn-reset">Reset Password Now</a>
            <p class="footer">
                © 2026 Sant Gadge Baba Amravati University Information helpdesk. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, html_content)

async def send_welcome_email(to_email: str, full_name: str):
    subject = "Welcome to SGBAU Nexus AI! 🎓"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .email-container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f7faf8;
                color: #062f21;
                padding: 40px 20px;
                max-width: 600px;
                margin: auto;
                border: 1px solid rgba(16, 185, 129, 0.15);
                border-radius: 16px;
            }}
            .header {{
                text-align: center;
                font-size: 28px;
                font-weight: 800;
                color: #10b981;
                margin-bottom: 25px;
            }}
            .welcome-card {{
                background: #ffffff;
                border: 1px solid rgba(16, 185, 129, 0.08);
                border-radius: 12px;
                padding: 30px;
                margin-bottom: 25px;
            }}
            .greet {{
                font-size: 20px;
                font-weight: 700;
                color: #041c14;
                margin-bottom: 15px;
            }}
            .body-text {{
                font-size: 15px;
                line-height: 1.6;
                color: #3c5e52;
                margin-bottom: 20px;
            }}
            .action-button {{
                display: inline-block;
                background: #10b981;
                color: #ffffff !important;
                font-weight: 700;
                padding: 12px 30px;
                border-radius: 8px;
                text-decoration: none;
                margin: 15px auto;
                text-align: center;
            }}
            .footer {{
                text-align: center;
                font-size: 12px;
                color: #8fa69c;
                margin-top: 30px;
                border-top: 1px solid rgba(16, 185, 129, 0.1);
                padding-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="cid:nexus_logo" alt="SGBAU Nexus AI Logo" style="max-width: 120px; border-radius: 50%; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);" />
            </div>
            <div class="header">SGBAU Nexus AI</div>
            <div class="welcome-card">
                <div class="greet">Hi {full_name},</div>
                <p class="body-text">Welcome to <strong>SGBAU Nexus AI</strong>! We are thrilled to have you join our intelligent portal. Your account has been verified and registered successfully.</p>
                <p class="body-text">With SGBAU Nexus AI, you get instant access to cutoff predictions, branch statistics, syllabus inquiries, and official university notifications in an interactive Generative UI dashboard.</p>
                <div style="text-align: center;">
                    <a href="http://localhost:5173" class="action-button">Go to Dashboard</a>
                </div>
            </div>
            <div class="footer">
                <p>© 2026 SGBAU Nexus AI. All rights reserved.</p>
                <p>Sant Gadge Baba Amravati University, Maharashtra, India</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(to_email, subject, html_content)
