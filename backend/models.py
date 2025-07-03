from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    tech = Column(String)  # Comma-separated
    github = Column(String)
    download = Column(String)
    readmore = Column(String)
    image = Column(String)
    order_ = Column(Integer, default=0)  # Renamed from 'order' to 'order_'

class MediumPost(Base):
    __tablename__ = "mediumposts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    excerpt = Column(String)
    date = Column(String)
    link = Column(String)

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, nullable=True)

class About(Base):
    __tablename__ = 'about'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    years_experience = Column(String)