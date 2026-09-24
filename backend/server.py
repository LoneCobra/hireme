from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth config
JWT_SECRET = os.environ.get('JWT_SECRET', 'hireme-super-secret-key-2026')
JWT_ALGO = 'HS256'
JWT_EXPIRE_HOURS = 24 * 7
pwd_ctx = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Helpers ----------------
def now_display() -> str:
    return datetime.utcnow().strftime('%d %b %Y')


def make_token(email: str) -> str:
    payload = {'sub': email, 'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        email = payload.get('sub')
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token')
    user = await db.admin_users.find_one({'email': email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user


# ---------------- Models ----------------
class LoginInput(BaseModel):
    email: str
    password: str


class CategoryCreate(BaseModel):
    name: str
    status: bool = True
    trending: bool = False


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[bool] = None
    trending: Optional[bool] = None


class SubCategoryCreate(BaseModel):
    name: str
    category: str
    status: bool = True


class SubCategoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[bool] = None


def clean(doc: dict) -> dict:
    doc.pop('_id', None)
    return doc


# ---------------- Auth routes ----------------
@api_router.post('/auth/login')
async def login(data: LoginInput):
    user = await db.admin_users.find_one({'email': data.email.lower().strip()})
    if not user or not pwd_ctx.verify(data.password, user['password']):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    token = make_token(user['email'])
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {'name': user['name'], 'email': user['email'], 'role': user['role']},
    }


@api_router.get('/auth/me')
async def me(user=Depends(get_current_user)):
    return {'name': user['name'], 'email': user['email'], 'role': user['role']}


# ---------------- Education Categories ----------------
@api_router.get('/education-categories')
async def list_categories(user=Depends(get_current_user)):
    rows = await db.education_categories.find().sort('created_at', -1).to_list(1000)
    return [clean(r) for r in rows]


@api_router.post('/education-categories')
async def create_category(data: CategoryCreate, user=Depends(get_current_user)):
    doc = {
        'id': str(uuid.uuid4()),
        'name': data.name.strip(),
        'status': data.status,
        'trending': data.trending,
        'updatedBy': user['name'],
        'updatedAt': now_display(),
        'created_at': datetime.utcnow().isoformat(),
    }
    await db.education_categories.insert_one(doc)
    return clean(doc)


@api_router.put('/education-categories/{cid}')
async def update_category(cid: str, data: CategoryUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if 'name' in updates:
        updates['name'] = updates['name'].strip()
    updates['updatedBy'] = user['name']
    updates['updatedAt'] = now_display()
    res = await db.education_categories.find_one_and_update(
        {'id': cid}, {'$set': updates}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail='Category not found')
    return clean(res)


@api_router.delete('/education-categories/{cid}')
async def delete_category(cid: str, user=Depends(get_current_user)):
    res = await db.education_categories.delete_one({'id': cid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Category not found')
    return {'success': True}


# ---------------- Education Sub Categories ----------------
@api_router.get('/education-sub-categories')
async def list_subcategories(user=Depends(get_current_user)):
    rows = await db.education_sub_categories.find().sort('created_at', -1).to_list(1000)
    return [clean(r) for r in rows]


@api_router.post('/education-sub-categories')
async def create_subcategory(data: SubCategoryCreate, user=Depends(get_current_user)):
    doc = {
        'id': str(uuid.uuid4()),
        'name': data.name.strip(),
        'category': data.category,
        'status': data.status,
        'updatedBy': user['name'],
        'updatedAt': now_display(),
        'created_at': datetime.utcnow().isoformat(),
    }
    await db.education_sub_categories.insert_one(doc)
    return clean(doc)


@api_router.put('/education-sub-categories/{sid}')
async def update_subcategory(sid: str, data: SubCategoryUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if 'name' in updates:
        updates['name'] = updates['name'].strip()
    updates['updatedBy'] = user['name']
    updates['updatedAt'] = now_display()
    res = await db.education_sub_categories.find_one_and_update(
        {'id': sid}, {'$set': updates}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail='Sub category not found')
    return clean(res)


@api_router.delete('/education-sub-categories/{sid}')
async def delete_subcategory(sid: str, user=Depends(get_current_user)):
    res = await db.education_sub_categories.delete_one({'id': sid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Sub category not found')
    return {'success': True}


# ---------------- Dashboard ----------------
@api_router.get('/dashboard')
async def dashboard(user=Depends(get_current_user)):
    cat_count = await db.education_categories.count_documents({})
    return {
        'stats': [
            {'label': 'ACTIVE CANDIDATES', 'value': 36, 'icon': 'Users', 'color': '#2c0eee'},
            {'label': 'ACTIVE JOBS', 'value': 10, 'icon': 'Briefcase', 'color': '#f61d25'},
            {'label': 'ACTIVE COMPANIES', 'value': 6, 'icon': 'Building2', 'color': '#2c0eee'},
            {'label': 'TOTAL SEARCH COUNT', 'value': 19, 'icon': 'Search', 'color': '#f61d25'},
        ],
        'jobsCreatedMonthly': [
            {'month': 'Jan', 'value': 4}, {'month': 'Feb', 'value': 2}, {'month': 'Mar', 'value': 6},
            {'month': 'Apr', 'value': 3}, {'month': 'May', 'value': 5}, {'month': 'Jun', 'value': 8},
            {'month': 'Jul', 'value': 3},
        ],
        'jobsByIndustry': [
            {'name': 'Software', 'value': 31, 'fill': '#2c0eee'},
            {'name': 'Information Tech', 'value': 15, 'fill': '#f61d25'},
            {'name': 'Banking', 'value': 12, 'fill': '#2c0eee'},
            {'name': 'Sales & Mktg', 'value': 9, 'fill': '#f61d25'},
        ],
        'candidatesMonthly': [
            {'month': 'Jan', 'value': 12}, {'month': 'Feb', 'value': 18}, {'month': 'Mar', 'value': 15},
            {'month': 'Apr', 'value': 24}, {'month': 'May', 'value': 30}, {'month': 'Jun', 'value': 27},
        ],
        'recentCompanies': [
            {'id': 1, 'company': 'Shekhawat Tech', 'industry': 'Software', 'date': '24 Sep 2026', 'status': 'Active'},
            {'id': 2, 'company': 'CC Solutions', 'industry': 'Software', 'date': '24 Sep 2026', 'status': 'Active'},
            {'id': 3, 'company': 'Vertex Digital', 'industry': 'IT', 'date': '22 Sep 2026', 'status': 'Pending'},
            {'id': 4, 'company': 'Quantum Labs', 'industry': 'AI', 'date': '21 Sep 2026', 'status': 'Active'},
        ],
        'recentJobs': [
            {'id': 1, 'title': 'Demo Engineer', 'company': 'HealthPlus', 'date': '24 Sep 2026', 'status': 'Published'},
            {'id': 2, 'title': 'Lecturer', 'company': 'HealthPlus', 'date': '24 Sep 2026', 'status': 'Published'},
            {'id': 3, 'title': 'React Developer', 'company': 'Maxgen', 'date': '23 Sep 2026', 'status': 'Draft'},
            {'id': 4, 'title': 'Data Analyst', 'company': 'Vertex', 'date': '22 Sep 2026', 'status': 'Published'},
        ],
        'totalCategories': cat_count,
    }


# ---------------- Generic Master CRUD ----------------
def register_master(path: str, collection: str, allowed: list):
    coll = collection

    @api_router.get(f'/{path}', name=f'list_{coll}')
    async def _list(user=Depends(get_current_user)):
        rows = await db[coll].find().sort('created_at', -1).to_list(2000)
        return [clean(r) for r in rows]

    @api_router.post(f'/{path}', name=f'create_{coll}')
    async def _create(data: dict, user=Depends(get_current_user)):
        if not str(data.get('name', '')).strip():
            raise HTTPException(status_code=400, detail='Name is required')
        doc = {'id': str(uuid.uuid4())}
        for f in allowed:
            if f in data:
                doc[f] = data[f]
        doc['name'] = str(doc.get('name', '')).strip()
        doc.setdefault('status', True)
        doc['updatedBy'] = user['name']
        doc['updatedAt'] = now_display()
        doc['created_at'] = datetime.utcnow().isoformat()
        await db[coll].insert_one(doc)
        return clean(doc)

    @api_router.put(f'/{path}/{{item_id}}', name=f'update_{coll}')
    async def _update(item_id: str, data: dict, user=Depends(get_current_user)):
        updates = {f: data[f] for f in allowed if f in data}
        if 'name' in updates:
            updates['name'] = str(updates['name']).strip()
        updates['updatedBy'] = user['name']
        updates['updatedAt'] = now_display()
        res = await db[coll].find_one_and_update({'id': item_id}, {'$set': updates}, return_document=True)
        if not res:
            raise HTTPException(status_code=404, detail='Item not found')
        return clean(res)

    @api_router.delete(f'/{path}/{{item_id}}', name=f'delete_{coll}')
    async def _delete(item_id: str, user=Depends(get_current_user)):
        res = await db[coll].delete_one({'id': item_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail='Item not found')
        return {'success': True}


register_master('states', 'states', ['name', 'status'])
register_master('cities', 'cities', ['name', 'state', 'image', 'trending', 'status'])
register_master('industries', 'industries', ['name', 'status'])
register_master('sub-industries', 'sub_industries', ['name', 'industry', 'status'])
register_master('skills', 'skills', ['name', 'status'])


# ---------------- Public (homepage) ----------------
@api_router.get('/public/trending-cities')
async def trending_cities():
    rows = await db.cities.find({'trending': True, 'status': True}).sort('created_at', 1).to_list(50)
    return [{'name': r['name'], 'image': r.get('image')} for r in rows[:8]]


@api_router.get('/')
async def root():
    return {'message': 'HireMe Admin API'}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------------- Seeding ----------------
CATEGORY_SEED = [
    ('Graduate Diploma', True, True, 'yash soni', '23 Sep 2026'),
    ('Associate Science (AS)', False, True, '-', '09 Sep 2026'),
    ('Chartered Global Management Accountant (CGMA)', False, True, '-', '09 Sep 2026'),
    ('Associate Chartered Management Accountant (ACMA)', False, True, '-', '09 Sep 2026'),
    ('Bachelor Of Journalism & Mass Communication (BJMC)', False, True, '-', '09 Sep 2026'),
    ('Bachelor Of Elementary Education (B.El.Ed)', False, True, '-', '09 Sep 2026'),
    ('Bachelor Of Fine Arts (B.F.A)', False, True, '-', '09 Sep 2026'),
    ('Bachelor Of Hotel Management And Catering Technology (BHMCT)', False, True, '-', '09 Sep 2026'),
    ('Bachelor Of Unani Medicine And Surgery (B.U.M.S)', False, True, '-', '09 Sep 2026'),
    ('Bachelor Of Physical Education (B.P.Ed)', False, True, '-', '09 Sep 2026'),
    ('Master Of Business Administration (MBA)', True, True, 'priya k', '08 Sep 2026'),
    ('Master Of Computer Applications (MCA)', False, False, '-', '07 Sep 2026'),
    ('Bachelor Of Engineering', False, True, '-', '06 Sep 2026'),
]

SUBCATEGORY_SEED = [
    ('Computer Science', 'Bachelor Of Engineering', True, 'yash soni', '23 Sep 2026'),
    ('Mechanical Engineering', 'Bachelor Of Engineering', True, '-', '10 Sep 2026'),
    ('Finance', 'Master Of Business Administration (MBA)', True, 'priya k', '09 Sep 2026'),
    ('Marketing', 'Master Of Business Administration (MBA)', True, '-', '09 Sep 2026'),
    ('Data Science', 'Master Of Computer Applications (MCA)', True, '-', '08 Sep 2026'),
    ('Painting', 'Bachelor Of Fine Arts (B.F.A)', False, '-', '07 Sep 2026'),
    ('Journalism', 'Bachelor Of Journalism & Mass Communication (BJMC)', True, '-', '06 Sep 2026'),
]


@app.on_event('startup')
async def seed():
    # Super admin
    if not await db.admin_users.find_one({'email': 'admin@hireme.in'}):
        await db.admin_users.insert_one({
            'id': str(uuid.uuid4()),
            'name': 'Komal Saini',
            'email': 'admin@hireme.in',
            'password': pwd_ctx.hash('admin123'),
            'role': 'Super Admin',
        })
        logger.info('Seeded superadmin')

    if await db.education_categories.count_documents({}) == 0:
        docs = []
        for i, (name, trending, st, by, at) in enumerate(CATEGORY_SEED):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'trending': trending, 'status': st,
                'updatedBy': by, 'updatedAt': at,
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.education_categories.insert_many(docs)
        logger.info('Seeded education categories')

    if await db.education_sub_categories.count_documents({}) == 0:
        docs = []
        for i, (name, cat, st, by, at) in enumerate(SUBCATEGORY_SEED):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'category': cat, 'status': st,
                'updatedBy': by, 'updatedAt': at,
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.education_sub_categories.insert_many(docs)
        logger.info('Seeded education sub categories')

    # States
    if await db.states.count_documents({}) == 0:
        states = [
            'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal',
            'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Kerala', 'Punjab', 'Haryana',
            'Madhya Pradesh', 'Bihar', 'Andhra Pradesh', 'Goa',
        ]
        docs = []
        for i, name in enumerate(states):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'status': True,
                'updatedBy': '-', 'updatedAt': '09 Sep 2026',
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.states.insert_many(docs)
        logger.info('Seeded states')

    # Cities (8 metros - trending, with monument images)
    if await db.cities.count_documents({}) == 0:
        cdn = 'https://apidata.hiremejobs.in/uploads'
        cities = [
            ('Delhi', 'Delhi', f'{cdn}/1790190449993-Delhi.png'),
            ('Kolkata', 'West Bengal', f'{cdn}/1790190469638-Kolkata.png'),
            ('Hyderabad', 'Telangana', f'{cdn}/1790190007500-Hyderabad-(1).png'),
            ('Chennai', 'Tamil Nadu', f'{cdn}/1790190437075-Chennai.png'),
            ('Pune', 'Maharashtra', f'{cdn}/1790190498685-Pune.png'),
            ('Mumbai', 'Maharashtra', f'{cdn}/1790190483234-Mumbai.png'),
            ('Bengaluru (Bangalore)', 'Karnataka', f'{cdn}/1790190422646-Banglore.png'),
            ('Ahmedabad', 'Gujarat', f'{cdn}/1790190402072-Ahmedbad.png'),
        ]
        docs = []
        for i, (name, state, img) in enumerate(cities):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'state': state, 'image': img,
                'trending': True, 'status': True,
                'updatedBy': '-', 'updatedAt': '09 Sep 2026',
                'created_at': (datetime.utcnow() + timedelta(seconds=i)).isoformat(),
            })
        await db.cities.insert_many(docs)
        logger.info('Seeded cities')

    # Industries
    if await db.industries.count_documents({}) == 0:
        inds = [
            'Software', 'Information Technology', 'Banking / Financial Services',
            'Sales and Marketing', 'Artificial Intelligence', 'Consumer Electronics',
            'Healthcare', 'Education', 'Manufacturing', 'Retail',
        ]
        docs = []
        for i, name in enumerate(inds):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'status': True,
                'updatedBy': '-', 'updatedAt': '09 Sep 2026',
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.industries.insert_many(docs)
        logger.info('Seeded industries')

    # Sub Industries
    if await db.sub_industries.count_documents({}) == 0:
        subs = [
            ('Web Development', 'Software'), ('Mobile Development', 'Software'),
            ('Cloud Computing', 'Information Technology'), ('Cybersecurity', 'Information Technology'),
            ('Investment Banking', 'Banking / Financial Services'), ('Insurance', 'Banking / Financial Services'),
            ('Digital Marketing', 'Sales and Marketing'), ('Machine Learning', 'Artificial Intelligence'),
        ]
        docs = []
        for i, (name, ind) in enumerate(subs):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'industry': ind, 'status': True,
                'updatedBy': '-', 'updatedAt': '09 Sep 2026',
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.sub_industries.insert_many(docs)
        logger.info('Seeded sub industries')

    # Skills
    if await db.skills.count_documents({}) == 0:
        skills = [
            'React.Js', 'Node.Js', 'Python', 'JavaScript (ES6+)', 'HTML5/CSS3', 'Git',
            'AWS', 'Docker', 'Kubernetes', 'SQL', 'Java', 'Redux', 'Machine Learning', 'DevOps',
        ]
        docs = []
        for i, name in enumerate(skills):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'status': True,
                'updatedBy': '-', 'updatedAt': '09 Sep 2026',
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.skills.insert_many(docs)
        logger.info('Seeded skills')


@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()
