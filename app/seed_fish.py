import asyncio
import sys
import os

# Add the project root to sys.path to allow imports
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.service.db_service import AsyncSessionLocal
from app.base import Fish
from app.api.fish.data import MEDITERRANEAN_FISH


async def seed_fish():
    print("Starting fish seeding...")
    async with AsyncSessionLocal() as session:
        for fish_data in MEDITERRANEAN_FISH:
            # Check if fish already exists
            stmt = select(Fish).where(Fish.he_name == fish_data["he_name"])
            result = await session.execute(stmt)
            existing_fish = result.scalar_one_or_none()

            if not existing_fish:
                new_fish = Fish(
                    he_name=fish_data["he_name"], en_name=fish_data["en_name"]
                )
                session.add(new_fish)
                print(f"Added: {fish_data['en_name']}")
            else:
                print(f"Skipped (exists): {fish_data['en_name']}")

        await session.commit()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(seed_fish())
