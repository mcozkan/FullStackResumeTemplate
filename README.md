# Data Scientist Portfolio Template

A full-stack portfolio project template for data scientists and developers, featuring:
- **Admin Panel** (React) for content management
- **Backend API** (FastAPI + SQLite) for data and authentication
- **Public Website** (HTML/JS/CSS) for visitors

---

## Project Structure

```
portfolio_template/
  admin/      # React-based admin panel (manage projects, skills, posts, etc.)
  backend/    # FastAPI backend (API, DB, authentication)
  public/     # Static public website (HTML, JS, CSS)
  README.md   # This file
```

---

## Features
- **Admin Panel**: Add/edit/delete projects, skills, blog posts, profile photo, and about section. Button-based project reordering.
- **Backend API**: CRUD for all content, JWT-based authentication, file uploads, SQLite database.
- **Public Website**: Modern, responsive portfolio with project highlights, skills, blog posts, and contact form.

---

## Setup & Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd portfolio_template
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# Or: source venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
# If first run, create the DB:
python
>>> from models import Base, engine
>>> Base.metadata.create_all(bind=engine)
>>> exit()
# Start the backend server:
uvicorn main:app --reload
```
- API runs at: `http://localhost:8000`

### 3. Admin Panel Setup (React)
```bash
cd ../admin
npm install
npm run dev
```
- Admin panel runs at: `http://localhost:5173`

### 4. Public Website
- Static files in `public/` can be served by any web server (or just open `public/index.html` in your browser).
- For local API access, ensure backend is running at `localhost:8000`.

---

## Usage
- **Admin Panel**: Log in with your credentials, manage content, reorder projects, upload images, etc.
- **Backend**: Handles all data, authentication, and file storage.
- **Public Site**: Displays your portfolio, always shows the latest content from the backend.

---

## Deployment
- **Backend**: Deploy with Uvicorn/Gunicorn on a server (e.g., DigitalOcean, AWS, Heroku).
- **Admin Panel**: Build with `npm run build` and deploy the static files to Netlify, Vercel, or your own server.
- **Public**: Serve as static files (can be on the same server as backend, or a CDN).
- **Environment Variables**: Use `.env` files for secrets and config (never commit secrets to git).

---

## Troubleshooting
- **DB errors**: If you change models, run migrations or recreate the DB.
- **CORS issues**: Make sure backend allows requests from your frontend origins.
- **File uploads**: Ensure `static/` folders exist and are writable.
- **API not found**: Check backend is running and accessible at the expected URL.

---

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR for improvements.

---

## License
MIT License. See LICENSE file for details. 