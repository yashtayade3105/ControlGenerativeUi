import os
import csv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import College, Cutoff
from app.db.session import engine, Base

async def init_db():
    async with engine.begin() as conn:
        # Create all tables if not exist
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully!")

async def seed_data(db: AsyncSession):
    # Check if colleges already exist
    result = await db.execute(select(College).limit(1))
    if result.scalars().first():
        print("Database already contains college records. Skipping seed.")
        return

    print("Seeding SGBAU Colleges dataset...")
    # Calculate relative paths dynamically to support both local development and cloud (Render) hosting
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    colleges_csv_path = os.path.join(base_dir, "sgbau_colleges_with_websites.csv")
    cutoffs_csv_path = os.path.join(base_dir, "sgbau_cutoffs.csv")

    if not os.path.exists(colleges_csv_path) or not os.path.exists(cutoffs_csv_path):
        print("Dataset CSV files not found. Seeding aborted.")
        return

    # Seed Colleges using built-in csv module (removes pandas dependency)
    colleges_seen = set()
    with open(colleges_csv_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            college_code = int(row['college_code'])
            if college_code not in colleges_seen:
                colleges_seen.add(college_code)
                college = College(
                    college_code=college_code,
                    college_name=row['college_name'],
                    location=row['location'],
                    college_type=row['college_type'],
                    website_link=row['website_link'] if row.get('website_link') else None
                )
                db.add(college)
    
    await db.flush()
    print("Colleges table seeded successfully!")

    # Seed Cutoffs using built-in csv module
    print("Seeding SGBAU Cutoffs dataset (this may take a few moments)...")
    cutoffs_to_add = []
    
    with open(cutoffs_csv_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cutoff = Cutoff(
                college_code=int(row['college_code']),
                branch=row['branch'],
                year=int(row['year']),
                category=row['category'],
                cutoff_percentile=float(row['cutoff_percentile']) if row.get('cutoff_percentile') else 0.0,
                cap_round=int(row['cap_round'])
            )
            cutoffs_to_add.append(cutoff)
            
            # Batch insert to prevent memory overflow
            if len(cutoffs_to_add) >= 2000:
                db.add_all(cutoffs_to_add)
                await db.flush()
                cutoffs_to_add = []
                
    if cutoffs_to_add:
        db.add_all(cutoffs_to_add)
        await db.flush()
        
    await db.commit()
    print("Cutoffs table seeded successfully!")
