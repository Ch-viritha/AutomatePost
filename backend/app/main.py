from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
from .database import Base, engine, get_db
from .models import Post
from .schemas import PostCreate, PostOut
Base.metadata.create_all(bind=engine)
app=FastAPI(title='OrbitPost API',version='1.0.0',description='Local-first social content workspace API')
app.add_middleware(CORSMiddleware,allow_origins=['*'],allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
UPLOAD_DIR=Path(__file__).resolve().parent.parent/'uploads'; UPLOAD_DIR.mkdir(exist_ok=True)
@app.get('/api/health')
def health(): return {'status':'ok','service':'OrbitPost API'}
@app.get('/api/posts',response_model=list[PostOut])
def list_posts(db:Session=Depends(get_db)): return db.query(Post).order_by(Post.created_at.desc()).all()
@app.post('/api/posts',response_model=PostOut)
def create_post(payload:PostCreate,db:Session=Depends(get_db)):
    post=Post(**payload.model_dump()); db.add(post); db.commit(); db.refresh(post); return post
@app.patch('/api/posts/{post_id}',response_model=PostOut)
def update_post(post_id:int,payload:PostCreate,db:Session=Depends(get_db)):
    post=db.get(Post,post_id)
    if not post: raise HTTPException(404,'Post not found')
    for key,value in payload.model_dump().items(): setattr(post,key,value)
    db.commit(); db.refresh(post); return post
@app.delete('/api/posts/{post_id}')
def delete_post(post_id:int,db:Session=Depends(get_db)):
    post=db.get(Post,post_id)
    if not post: raise HTTPException(404,'Post not found')
    db.delete(post); db.commit(); return {'deleted':True}
@app.get('/api/channels')
def channels():
    return [{'id':x,'name':n,'connected':False,'status':'oauth_required'} for x,n in [('instagram','Instagram'),('youtube','YouTube'),('facebook','Facebook'),('tiktok','TikTok')]]
@app.post('/api/media')
async def upload_media(file:UploadFile=File(...)):
    suffix=Path(file.filename or '').suffix[:12]
    name=f'{uuid4().hex}{suffix}'
    target=UPLOAD_DIR/name
    size=0
    with target.open('wb') as out:
        while chunk:=await file.read(1024*1024):
            size+=len(chunk)
            if size>250*1024*1024:
                target.unlink(missing_ok=True); raise HTTPException(413,'File exceeds 250 MB limit')
            out.write(chunk)
    return {'filename':name,'original_name':file.filename,'size':size,'url':f'/uploads/{name}'}
