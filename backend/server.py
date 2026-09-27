from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
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
    company_count = await db.companies.count_documents({'status': 'active'})
    job_count = await db.jobs.count_documents({})
    candidate_count = await db.candidates.count_documents({})
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    return {
        'stats': [
            {'label': 'ACTIVE CANDIDATES', 'value': candidate_count, 'icon': 'Users', 'color': '#2c0eee'},
            {'label': 'ACTIVE JOBS', 'value': job_count, 'icon': 'Briefcase', 'color': '#f61d25'},
            {'label': 'ACTIVE COMPANIES', 'value': company_count, 'icon': 'Building2', 'color': '#2c0eee'},
            {'label': 'TOTAL SEARCH COUNT', 'value': 0, 'icon': 'Search', 'color': '#f61d25'},
        ],
        'jobsCreatedMonthly': [{'month': m, 'value': 0} for m in months],
        'jobsByIndustry': [],
        'candidatesMonthly': [{'month': m, 'value': 0} for m in months[:6]],
        'recentCompanies': [],
        'recentJobs': [],
        'totalCategories': cat_count,
    }


# ---------------- Generic Master CRUD ----------------
def register_master(path: str, collection: str, allowed: list):
    coll = collection

    @api_router.get(f'/{path}', name=f'list_{coll}')
    async def _list(user=Depends(get_current_user)):
        rows = await db[coll].find().sort('created_at', -1).to_list(20000)
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

    @api_router.post(f'/{path}/bulk', name=f'bulk_{coll}')
    async def _bulk(payload: dict, user=Depends(get_current_user)):
        items = payload.get('items') or []
        docs = []
        for it in items:
            if not str(it.get('name', '')).strip():
                continue
            doc = {'id': str(uuid.uuid4())}
            for f in allowed:
                if f in it:
                    doc[f] = it[f]
            doc['name'] = str(doc.get('name', '')).strip()
            doc.setdefault('status', True)
            doc['updatedBy'] = user['name']
            doc['updatedAt'] = now_display()
            doc['created_at'] = datetime.utcnow().isoformat()
            docs.append(doc)
        if docs:
            await db[coll].insert_many(docs)
        return {'inserted': len(docs)}


_SIMPLE = ['name', 'status']
register_master('states', 'states', _SIMPLE)
register_master('cities', 'cities', ['name', 'state', 'image', 'trending', 'status'])
register_master('industries', 'industries', _SIMPLE)
register_master('sub-industries', 'sub_industries', ['name', 'industry', 'status'])
register_master('skills', 'skills', _SIMPLE)
register_master('education-categories', 'education_categories', ['name', 'trending', 'status'])
register_master('education-sub-categories', 'education_sub_categories', ['name', 'category', 'status'])
register_master('perk-benefit-categories', 'perk_benefit_categories', _SIMPLE)
register_master('perk-benefits', 'perk_benefits', ['name', 'category', 'status'])
register_master('languages', 'languages', _SIMPLE)
register_master('currencies', 'currencies', ['name', 'code', 'symbol', 'status'])
register_master('notice-periods', 'notice_periods', _SIMPLE)
register_master('company-types', 'company_types', _SIMPLE)
register_master('company-sizes', 'company_sizes', _SIMPLE)
register_master('company-subscriptions', 'company_subscriptions', _SIMPLE)
register_master('company-faqs', 'company_faqs', ['name', 'answer', 'status'])
register_master('candidate-faqs', 'candidate_faqs', ['name', 'answer', 'status'])
register_master('job-types', 'job_types', _SIMPLE)
register_master('function-role-categories', 'function_role_categories', _SIMPLE)
register_master('function-roles', 'function_roles', ['name', 'category', 'status'])
register_master('experience-levels', 'experience_levels', _SIMPLE)
register_master('workplace-types', 'workplace_types', _SIMPLE)
register_master('salary-options', 'salary_options', _SIMPLE)
register_master('email-templates', 'email_templates', ['name', 'key', 'subject', 'body', 'recipient', 'dispatch', 'status'])


# ---------------- Companies (standalone, not a master) ----------------
COMPANY_FIELDS = ['name', 'slug', 'website', 'foundedYear', 'gst', 'about',
                  'industry', 'subIndustry', 'companySize', 'logo', 'banner',
                  'status', 'trending']


@api_router.get('/companies')
async def list_companies(user=Depends(get_current_user)):
    rows = await db.companies.find().sort('created_at', -1).to_list(5000)
    return [clean(r) for r in rows]


@api_router.get('/companies/{cid}')
async def get_company(cid: str, user=Depends(get_current_user)):
    row = await db.companies.find_one({'id': cid})
    if not row:
        raise HTTPException(status_code=404, detail='Company not found')
    return clean(row)


@api_router.post('/companies')
async def create_company(data: dict, user=Depends(get_current_user)):
    if not str(data.get('name', '')).strip():
        raise HTTPException(status_code=400, detail='Company name is required')
    doc = {'id': str(uuid.uuid4())}
    for f in COMPANY_FIELDS:
        if f in data:
            doc[f] = data[f]
    doc['name'] = str(doc.get('name', '')).strip()
    doc.setdefault('status', 'pending')
    doc.setdefault('trending', False)
    doc['updatedBy'] = user['name']
    doc['updatedAt'] = now_display()
    doc['created_at'] = datetime.utcnow().isoformat()
    await db.companies.insert_one(doc)
    return clean(doc)


@api_router.put('/companies/{cid}')
async def update_company(cid: str, data: dict, user=Depends(get_current_user)):
    updates = {f: data[f] for f in COMPANY_FIELDS if f in data}
    if 'name' in updates:
        updates['name'] = str(updates['name']).strip()
    updates['updatedBy'] = user['name']
    updates['updatedAt'] = now_display()
    res = await db.companies.find_one_and_update({'id': cid}, {'$set': updates}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail='Company not found')
    return clean(res)


@api_router.delete('/companies/{cid}')
async def delete_company(cid: str, user=Depends(get_current_user)):
    res = await db.companies.delete_one({'id': cid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Company not found')
    return {'success': True}


# ---------------- Candidates ----------------
CANDIDATE_FIELDS = [
    'name', 'email', 'phone', 'gender', 'dob', 'city', 'state', 'photo',
    'jobTitle', 'totalExperience', 'experienceLevel', 'currentSalary',
    'expectedSalary', 'noticePeriod', 'educationCategory', 'skills',
    'languages', 'about', 'resume', 'status', 'featured',
]


@api_router.get('/candidates')
async def list_candidates(user=Depends(get_current_user)):
    rows = await db.candidates.find().sort('created_at', -1).to_list(5000)
    return [clean(r) for r in rows]


@api_router.get('/candidates/{cid}')
async def get_candidate(cid: str, user=Depends(get_current_user)):
    row = await db.candidates.find_one({'id': cid})
    if not row:
        raise HTTPException(status_code=404, detail='Candidate not found')
    return clean(row)


@api_router.post('/candidates')
async def create_candidate(data: dict, user=Depends(get_current_user)):
    if not str(data.get('name', '')).strip():
        raise HTTPException(status_code=400, detail='Candidate name is required')
    doc = {'id': str(uuid.uuid4())}
    for f in CANDIDATE_FIELDS:
        if f in data:
            doc[f] = data[f]
    doc['name'] = str(doc.get('name', '')).strip()
    doc.setdefault('status', 'pending')
    doc.setdefault('featured', False)
    doc.setdefault('skills', [])
    doc.setdefault('languages', [])
    doc['updatedBy'] = user['name']
    doc['updatedAt'] = now_display()
    doc['created_at'] = datetime.utcnow().isoformat()
    await db.candidates.insert_one(doc)
    return clean(doc)


@api_router.put('/candidates/{cid}')
async def update_candidate(cid: str, data: dict, user=Depends(get_current_user)):
    updates = {f: data[f] for f in CANDIDATE_FIELDS if f in data}
    if 'name' in updates:
        updates['name'] = str(updates['name']).strip()
    updates['updatedBy'] = user['name']
    updates['updatedAt'] = now_display()
    res = await db.candidates.find_one_and_update({'id': cid}, {'$set': updates}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail='Candidate not found')
    return clean(res)


@api_router.delete('/candidates/{cid}')
async def delete_candidate(cid: str, user=Depends(get_current_user)):
    res = await db.candidates.delete_one({'id': cid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Candidate not found')
    return {'success': True}


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
# Comprehensive list of Indian States/UTs with major cities.
INDIA_STATES = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kadapa', 'Tirupati', 'Anantapur', 'Kakinada', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Hajipur', 'Sasaram', 'Dehri', 'Bettiah', 'Motihari', 'Kishanganj'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Dhamtari', 'Mahasamund'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch', 'Navsari', 'Vapi', 'Porbandar', 'Gandhidham', 'Mehsana', 'Bhuj', 'Valsad'],
    'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Kaithal', 'Rewari', 'Palwal'],
    'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Kullu', 'Manali', 'Bilaspur', 'Hamirpur', 'Una', 'Nahan', 'Palampur'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar', 'Chirkunda'],
    'Karnataka': ['Bengaluru (Bangalore)', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Udupi', 'Chitradurga', 'Kolar', 'Mandya', 'Chikmagalur'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam', 'Malappuram', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Vidisha', 'Shivpuri'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Malegaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalgaon', 'Nanded', 'Navi Mumbai'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Baghmara', 'Williamnagar'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Saiha'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Firozpur', 'Kapurthala', 'Phagwara', 'Barnala'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dhaulpur', 'Bharatpur', 'Tonk', 'Nagaur'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Nagercoil', 'Karur', 'Hosur', 'Cuddalore', 'Kancheepuram', 'Kumbakonam', 'Rajapalayam'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Ambassa'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Ayodhya'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Mussoorie', 'Almora'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Haldia', 'Krishnanagar', 'Darjeeling', 'Jalpaiguri'],
    'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder', 'Rangat'],
    'Chandigarh': ['Chandigarh'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
    'Delhi': ['Delhi', 'New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Pitampura'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Sopore', 'Kathua'],
    'Ladakh': ['Leh', 'Kargil'],
    'Lakshadweep': ['Kavaratti', 'Agatti', 'Minicoy'],
    'Puducherry': ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'],
}

# Metros pre-marked trending, with monument icons (order = homepage order).
_CDN = 'https://apidata.hiremejobs.in/uploads'
TRENDING_METROS = [
    ('Delhi', 'Delhi', f'{_CDN}/1790190449993-Delhi.png'),
    ('Kolkata', 'West Bengal', f'{_CDN}/1790190469638-Kolkata.png'),
    ('Hyderabad', 'Telangana', f'{_CDN}/1790190007500-Hyderabad-(1).png'),
    ('Chennai', 'Tamil Nadu', f'{_CDN}/1790190437075-Chennai.png'),
    ('Pune', 'Maharashtra', f'{_CDN}/1790190498685-Pune.png'),
    ('Mumbai', 'Maharashtra', f'{_CDN}/1790190483234-Mumbai.png'),
    ('Bengaluru (Bangalore)', 'Karnataka', f'{_CDN}/1790190422646-Banglore.png'),
    ('Ahmedabad', 'Gujarat', f'{_CDN}/1790190402072-Ahmedbad.png'),
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

    # Education/Industry/Skill masters intentionally start EMPTY (admin adds their own).

    # Load comprehensive Indian cities dataset (name, state, district)
    def canon_state(s: str) -> str:
        s = s.replace('*', '').replace(' & ', ' and ').strip()
        rename = {
            'Orissa': 'Odisha',
            'Uttaranchal': 'Uttarakhand',
            'Pondicherry': 'Puducherry',
            'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
            'Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
        }
        return rename.get(s, s)

    dataset = []
    try:
        with open(ROOT_DIR / 'data' / 'indian_cities.json', 'r', encoding='utf-8') as fh:
            raw = json.load(fh)
        for row in raw:
            city = str(row.get('City', '')).strip()
            state = canon_state(str(row.get('State', '')).strip())
            if city and state:
                dataset.append((city, state))
    except Exception as e:
        logger.warning(f'Could not load cities dataset: {e}')

    dataset_states = {st for _, st in dataset}

    # States (from dataset + curated + metro states, canonical & de-duplicated)
    if await db.states.count_documents({}) == 0:
        all_states = dataset_states | set(INDIA_STATES.keys()) | {st for _, st, _ in TRENDING_METROS}
        docs = []
        for i, name in enumerate(sorted(all_states)):
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'status': True,
                'updatedBy': '-', 'updatedAt': now_display(),
                'created_at': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            })
        await db.states.insert_many(docs)
        logger.info(f'Seeded {len(docs)} states')

    # Cities (metros first with images/trending, then full dataset, de-duplicated)
    if await db.cities.count_documents({}) == 0:
        base = datetime.utcnow()
        docs = []
        seen = set()
        for i, (name, state, img) in enumerate(TRENDING_METROS):
            seen.add(name.strip().lower())
            docs.append({
                'id': str(uuid.uuid4()), 'name': name, 'state': state, 'image': img,
                'trending': True, 'status': True,
                'updatedBy': '-', 'updatedAt': now_display(),
                'created_at': (base + timedelta(seconds=i)).isoformat(),
            })
        # aliases so dataset duplicates of metros are skipped
        seen.update({'bengaluru', 'bangalore', 'new delhi'})

        source = dataset if dataset else [(c, st) for st, cs in INDIA_STATES.items() for c in cs]
        counter = 0
        for city, state in source:
            key = city.strip().lower()
            if key in seen:
                continue
            seen.add(key)
            counter += 1
            docs.append({
                'id': str(uuid.uuid4()), 'name': city, 'state': state, 'image': '',
                'trending': False, 'status': True,
                'updatedBy': '-', 'updatedAt': now_display(),
                'created_at': (base + timedelta(seconds=1000 + counter)).isoformat(),
            })
        await db.cities.insert_many(docs)
        logger.info(f'Seeded {len(docs)} cities')


@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()
