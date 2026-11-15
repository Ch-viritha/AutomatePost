from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base
from datetime import datetime
class Post(Base):
    __tablename__='posts'
    id: Mapped[int]=mapped_column(primary_key=True,index=True)
    title: Mapped[str]=mapped_column(String(200),default='')
    caption: Mapped[str]=mapped_column(Text,default='')
    platform: Mapped[str]=mapped_column(String(40),default='')
    status: Mapped[str]=mapped_column(String(30),default='Draft')
    scheduled_at: Mapped[str|None]=mapped_column(String(50),nullable=True)
    media_name: Mapped[str|None]=mapped_column(String(255),nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
