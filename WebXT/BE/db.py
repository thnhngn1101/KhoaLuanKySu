import os
import psycopg2
from sqlalchemy import create_engine, MetaData
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://khoaluan_owner:npg_JOW4CSV8fqId@ep-rapid-cloud-a1nzf35c-pooler.ap-southeast-1.aws.neon.tech/khoaluan?sslmode=require"
engine = create_engine(DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )
