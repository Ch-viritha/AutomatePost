from pydantic import BaseModel, ConfigDict
from datetime import datetime
class PostCreate(BaseModel):
    title: str=''
    caption: str=''
    platform: str=''
    status: str='Draft'
    scheduled_at: str|None=None
    media_name: str|None=None
class PostOut(PostCreate):
    id: int
    created_at: datetime
    model_config=ConfigDict(from_attributes=True)
