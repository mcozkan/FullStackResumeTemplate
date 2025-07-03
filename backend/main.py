from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from models import Base, engine, get_db, Project, MediumPost, Skill, About
from jose import jwt, JWTError
from passlib.context import CryptContext
import shutil
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "https://your-netlify-domain.netlify.app",  # Replace with your actual Netlify domain
        "https://your-admin-domain.netlify.app"     # Replace with your admin panel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/public", StaticFiles(directory="../public"), name="public")

Base.metadata.create_all(bind=engine)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in the environment!")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")

if not ADMIN_USERNAME or not ADMIN_PASSWORD_HASH:
    raise RuntimeError("Admin credentials are not set in the environment!")

def authenticate(username: str, password: str):
    if username == ADMIN_USERNAME and pwd_context.verify(password, ADMIN_PASSWORD_HASH):
        return True
    return False

def create_token(username: str):
    return jwt.encode({"sub": username}, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/login")
def login(username: str = Form(...), password: str = Form(...)):
    if authenticate(username, password):
        return {"token": create_token(username)}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# --- Projects CRUD ---
@app.get("/api/projects")
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.order_).all()

@app.post("/api/projects")
def add_project(title: str = Form(...), description: str = Form(...), tech: str = Form(...), github: str = Form(...), download: str = Form(...), readmore: str = Form(...), image: UploadFile = File(None), db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    img_path = None
    if image:
        os.makedirs("static/images", exist_ok=True)
        img_path = f"static/images/{image.filename}"
        with open(img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    project = Project(title=title, description=description, tech=tech, github=github, download=download, readmore=readmore, image=img_path)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    project = db.query(Project).get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(project)
    db.commit()
    return {"ok": True}

@app.put("/api/projects/{project_id}")
def update_project(
    project_id: int,
    title: str = Form(...),
    description: str = Form(...),
    tech: str = Form(...),
    github: str = Form(...),
    download: str = Form(...),
    readmore: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    project = db.query(Project).get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Not found")
    project.title = title
    project.description = description
    project.tech = tech
    project.github = github
    project.download = download
    project.readmore = readmore
    if image:
        os.makedirs("static/images", exist_ok=True)
        img_path = f"static/images/{image.filename}"
        with open(img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        project.image = img_path
    db.commit()
    db.refresh(project)
    return project

@app.post("/api/projects/reorder")
def reorder_projects(order_data: dict, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    # order_data should be {"order": [id1, id2, id3, ...]}
    order_list = order_data.get("order", [])
    for idx, project_id in enumerate(order_list):
        project = db.query(Project).get(project_id)
        if project:
            project.order_ = idx
    db.commit()
    return {"ok": True}

# --- Medium Posts CRUD ---
@app.get("/api/medium-posts")
def get_posts(db: Session = Depends(get_db)):
    return db.query(MediumPost).all()

@app.post("/api/medium-posts")
def add_post(title: str = Form(...), excerpt: str = Form(...), date: str = Form(...), link: str = Form(...), db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    post = MediumPost(title=title, excerpt=excerpt, date=date, link=link)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@app.delete("/api/medium-posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    post = db.query(MediumPost).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(post)
    db.commit()
    return {"ok": True}

@app.put("/api/medium-posts/{post_id}")
def update_post(
    post_id: int,
    title: str = Form(...),
    excerpt: str = Form(...),
    date: str = Form(...),
    link: str = Form(...),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    post = db.query(MediumPost).get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Not found")
    post.title = title
    post.excerpt = excerpt
    post.date = date
    post.link = link
    db.commit()
    db.refresh(post)
    return post

@app.post("/api/profile-photo")
def upload_profile_photo(
    image: UploadFile = File(...),
    user: str = Depends(get_current_user)
):
    os.makedirs("static/profile", exist_ok=True)
    img_path = f"static/profile/{image.filename}"
    with open(img_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    # Save the filename to a reference file
    with open("static/profile/current.txt", "w") as f:
        f.write(img_path)
    return {"image_url": img_path}

@app.get("/api/profile-photo-url")
def get_profile_photo_url():
    try:
        with open("static/profile/current.txt") as f:
            img_path = f.read().strip()
        return {"image_url": img_path}
    except FileNotFoundError:
        return {"image_url": ""}

@app.get("/api/privacy-policy")
def get_privacy_policy():
    try:
        with open("static/privacy_policy.txt") as f:
            policy = f.read()
        return {"policy": policy}
    except FileNotFoundError:
        return {"policy": ""}

@app.post("/api/privacy-policy")
def update_privacy_policy(
    data: dict,
    user: str = Depends(get_current_user)
):
    policy = data.get("policy", "")
    os.makedirs("static", exist_ok=True)
    with open("static/privacy_policy.txt", "w") as f:
        f.write(policy)
    return {"policy": policy}

# --- Skills CRUD ---
@app.get("/api/skills")
def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()

@app.post("/api/skills")
def add_skill(name: str = Form(...), icon: UploadFile = File(None), db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    icon_path = None
    if icon:
        os.makedirs("static/skills", exist_ok=True)
        icon_path = f"static/skills/{icon.filename}"
        with open(icon_path, "wb") as buffer:
            shutil.copyfileobj(icon.file, buffer)
    skill = Skill(name=name, icon=icon_path)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@app.delete("/api/skills/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    skill = db.query(Skill).get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(skill)
    db.commit()
    return {"ok": True}

@app.get("/api/about")
def get_about(db: Session = Depends(get_db)):
    about = db.query(About).first()
    if not about:
        return {"text": "", "years_experience": ""}
    return {"text": about.text, "years_experience": about.years_experience}

@app.post("/api/about")
def update_about(
    text: str = Form(...),
    years_experience: str = Form(...),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user)
):
    about = db.query(About).first()
    if not about:
        about = About(text=text, years_experience=years_experience)
        db.add(about)
    else:
        about.text = text
        about.years_experience = years_experience
    db.commit()
    return {"text": about.text, "years_experience": about.years_experience}

@app.get("/")
def root():
    return FileResponse("../public/index.html")