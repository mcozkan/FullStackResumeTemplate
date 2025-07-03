# 🚀 Resume/Portfolio Template: Local Setup Guide

This guide will help you set up your own copy of the resume/portfolio template on your local machine. No advanced experience required!

---

## 1. Clone the Repository

Download the template code to your computer:

```sh
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

---

## 2. Set Up the Backend (FastAPI + Python)

### a. Create a Virtual Environment
```sh
cd backend
python -m venv venv
```

### b. Activate the Virtual Environment
- **Windows:**
  ```sh
  venv\Scripts\activate
  ```
- **Mac/Linux:**
  ```sh
  source venv/bin/activate
  ```

### c. Install Python Dependencies
```sh
pip install -r requirements.txt
```

### d. Initialize the Database
```sh
python
>>> from models import Base, engine
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

### e. Start the Backend Server
```sh
uvicorn main:app --reload
```
- The backend API will be available at: [http://localhost:8000](http://localhost:8000)

---

## 3. Set Up the Admin Panel (React + Node.js)

### a. Open a New Terminal Window/Tab
```sh
cd ../admin
npm install
npm run dev
```
- The admin panel will be available at: [http://localhost:5173](http://localhost:5173)

---

## 4. View the Public Portfolio Website
- Open `public/index.html` in your browser, or use a simple static server (like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VSCode) to serve the `public/` folder.

---

## 5. Configuration & Customization
- **API URLs:** If you deploy the backend/admin separately, update the API URLs in your frontend code to point to the correct backend address.
- **Environment Variables:** Add your secrets and config to `.env` files (not included in the repo).
- **Images:** Add your own profile and project images, or use the "Add image here" placeholders.

---

## 6. Troubleshooting
- If you see errors about missing modules, double-check you ran `pip install -r requirements.txt` and `npm install`.
- If you get CORS errors, make sure your backend allows requests from your frontend's address.
- For database issues, ensure you initialized the DB as shown above.

---

## 7. Ready to Go!
You can now:
- Log in to the admin panel to add/edit your projects, skills, and about info.
- See your changes reflected instantly on the public site.

---

**If you have any questions or run into issues, check the README or open an issue on GitHub!** 