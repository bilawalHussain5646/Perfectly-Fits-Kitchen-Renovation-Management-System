# 🚀 GoDaddy Subdomain Deployment Guide

## Your Setup
- **Subdomain**: `https://perfectly-fits-ramadan.lggf-promotor.com`
- **Subdomain document root in GoDaddy**: `public_html/perfectly-fits-ramadan.lggf-promotor.com/`

---

## 📁 WHERE TO UPLOAD FILES

```
~/                                                    ← Your cPanel home directory
│
├── public_html/
│   └── perfectly-fits-ramadan.lggf-promotor.com/   ← FRONTEND goes here
│         ├── index.html
│         ├── .htaccess
│         └── assets/
│               ├── index-xxxxx.js
│               └── index-xxxxx.css
│
└── perihelion-backend/                              ← BACKEND goes here (OUTSIDE public_html)
      ├── app.py
      ├── models.py
      ├── passenger_wsgi.py
      ├── requirements.txt
      └── uploads/                                   ← Auto-created for images
```

---

## 🌐 STEP 1: Upload the Frontend

1. Log in to **GoDaddy cPanel** → **File Manager**
2. Navigate to: `public_html/perfectly-fits-ramadan.lggf-promotor.com/`
3. Upload **ALL files from your local `frontend/dist/` folder**:
   - `index.html`
   - `.htaccess`  ← ⚠️ Critical! Don't skip this!
   - `assets/` folder (with all the JS/CSS inside)

> ✅ The `.htaccess` enables React Router — without it, page refreshes will give 404 errors.

---

## 🐍 STEP 2: Set Up the Python Backend App

### 2a. Create the Python Application in cPanel

1. In cPanel, find **"Setup Python App"** (under Software section)
2. Click **"Create Application"**
3. Fill in the settings:

| Setting | Value |
|---------|-------|
| **Python version** | 3.9 (or latest available) |
| **Application root** | `perihelion-backend` |
| **Application URL** | `perfectly-fits-ramadan.lggf-promotor.com/api` |
| **Application startup file** | `passenger_wsgi.py` |
| **Application Entry point** | `application` |

4. Click **Create**

### 2b. Upload Backend Files

Upload the contents of your local `backend/` folder to `~/perihelion-backend/` in cPanel:
- ✅ `app.py`
- ✅ `models.py`
- ✅ `passenger_wsgi.py`
- ✅ `requirements.txt`
- ✅ `reset_db.py`
- ❌ **Do NOT upload `env/`** — cPanel creates its own virtualenv

### 2c. Install Python Dependencies

In cPanel → Setup Python App → click your app → scroll to **"Execute python script"** section:
```
pip install -r /home/YOUR_USERNAME/perihelion-backend/requirements.txt
```

Or use the **Terminal** in cPanel:
```bash
source ~/virtualenv/perihelion-backend/3.9/bin/activate
cd ~/perihelion-backend
pip install -r requirements.txt
```

### 2d. Set Environment Variables

In cPanel → Setup Python App → your app → **"Environment variables"** section, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql+pymysql://DB_USER:DB_PASS@localhost:3306/DB_NAME` |
| `JWT_SECRET_KEY` | `some-very-long-random-secret-key-here` |

### 2e. Set Up MySQL Database

In cPanel → **MySQL Databases**:
1. Create database: e.g., `youraccount_invoicedb`
2. Create user + strong password
3. Add user to database with **All Privileges**
4. Use `localhost` as the DB host (GoDaddy MySQL is local on shared hosting)

### 2f. Restart the App

Click **Restart** in Setup Python App.

---

## ✅ STEP 3: Verify Everything Works

1. Visit `https://perfectly-fits-ramadan.lggf-promotor.com` → Should show login page
2. Visit `https://perfectly-fits-ramadan.lggf-promotor.com/api/auth/login` → Should return JSON error (method not allowed for GET, which is normal)
3. Log in with `admin` / `admin123` → **Change this password immediately!**

---

## 🔐 Post-Deployment Security

- [ ] Change admin password from `admin123`
- [ ] Use a strong, random 32+ char `JWT_SECRET_KEY`
- [ ] Enable **Free SSL** in cPanel → SSL/TLS for HTTPS
- [ ] Verify `uploads/` folder permissions are set to `755`

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| Page 404 on refresh | Check `.htaccess` is in `perfectly-fits-ramadan.lggf-promotor.com/` |
| API not responding | Check Python app is running in cPanel → Setup Python App |
| Login fails | Check `DATABASE_URL` env var, ensure DB user has privileges |
| CORS error in browser | The domain in `app.py` CORS origins must exactly match your site URL |
| Images not loading | Set `uploads/` folder to `755` permissions via File Manager |
