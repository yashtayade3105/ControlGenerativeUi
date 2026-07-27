from fastapi import APIRouter, Query
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/portal", tags=["HTML Portals"])

@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password_page(
    email: str = Query(..., description="User email for resetting password"),
    otp: str = Query(..., description="Verification code")
):
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - SGBAU Nexus AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
            :root {{
                --bg-dark: #070913;
                --card-bg: rgba(13, 17, 39, 0.45);
                --border-color: rgba(0, 242, 254, 0.15);
                --primary: #00f2fe;
                --secondary: #8b5cf6;
                --text-main: #f3f4f6;
                --text-muted: #9ca3af;
            }}
            * {{
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }}
            body {{
                background-color: var(--bg-dark);
                color: var(--text-main);
                font-family: 'Outfit', sans-serif;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
            }}
            /* Glassmorphism card */
            .reset-card {{
                background: var(--card-bg);
                backdrop-filter: blur(16px);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 40px;
                width: 90%;
                max-width: 450px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                text-align: center;
            }}
            h2 {{
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 10px;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }}
            p {{
                font-size: 14px;
                color: var(--text-muted);
                margin-bottom: 25px;
            }}
            .input-group {{
                margin-bottom: 20px;
                text-align: left;
            }}
            label {{
                display: block;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
                letter-spacing: 1px;
                color: var(--text-muted);
            }}
            input {{
                width: 100%;
                background: #0c111d;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #fff;
                padding: 12px 16px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s;
            }}
            input:focus {{
                border-color: var(--primary);
                box-shadow: 0 0 8px rgba(0, 242, 254, 0.2);
            }}
            .btn {{
                width: 100%;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: #000;
                font-weight: bold;
                padding: 12px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-size: 16px;
                margin-top: 10px;
                transition: all 0.3s;
            }}
            .btn:hover {{
                transform: translateY(-2px);
                box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
            }}
            .alert {{
                padding: 12px;
                border-radius: 8px;
                margin-top: 20px;
                font-size: 14px;
                display: none;
            }}
            .alert-success {{
                background: rgba(16, 185, 129, 0.15);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }}
            .alert-error {{
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }}
        </style>
    </head>
    <body>
        <div class="reset-card">
            <h2>🎓 SGBAU Nexus AI</h2>
            <p>Setup your new password below</p>
            
            <form id="reset-form">
                <input type="hidden" id="email" value="{email}">
                <input type="hidden" id="otp" value="{otp}">
                
                <div class="input-group">
                    <label for="password">New Password</label>
                    <input type="password" id="password" required placeholder="Minimum 6 characters">
                </div>
                
                <div class="input-group">
                    <label for="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" required placeholder="Re-enter password">
                </div>
                
                <button type="submit" class="btn">Update Password</button>
            </form>
            
            <div id="alert-box" class="alert"></div>
        </div>

        <script>
            document.getElementById('reset-form').addEventListener('submit', async function(e) {{
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const otp_code = document.getElementById('otp').value;
                const new_password = document.getElementById('password').value;
                const confirm_password = document.getElementById('confirm-password').value;
                const alertBox = document.getElementById('alert-box');
                
                if (new_password !== confirm_password) {{
                    alertBox.className = 'alert alert-error';
                    alertBox.textContent = 'Passwords do not match.';
                    alertBox.style.display = 'block';
                    return;
                }}
                
                try {{
                    const response = await fetch('/auth/reset-password', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json'
                        }},
                        body: JSON.stringify({{ email, otp_code, new_password }})
                    }});
                    
                    const result = await response.json();
                    
                    if (response.ok) {{
                        alertBox.className = 'alert alert-success';
                        alertBox.textContent = result.message || 'Password reset successfully!';
                        alertBox.style.display = 'block';
                        document.getElementById('reset-form').style.display = 'none';
                    }} else {{
                        alertBox.className = 'alert alert-error';
                        alertBox.textContent = result.detail || 'Failed to reset password.';
                        alertBox.style.display = 'block';
                    }}
                }} catch (error) {{
                    alertBox.className = 'alert alert-error';
                    alertBox.textContent = 'An unexpected error occurred.';
                    alertBox.style.display = 'block';
                }}
            }});
        </script>
    </body>
    </html>
    """
    return html_content
