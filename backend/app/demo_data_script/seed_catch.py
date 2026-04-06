import asyncio
import sys
import os
import random
from datetime import timedelta

# Add the project root to sys.path to allow imports
sys.path.append(os.getcwd())

from sqlalchemy import select, func
from app.service.db_service import AsyncSessionLocal
from app.base import Catch, Session, Fish


async def seed_catches():
    print("Starting catch seeding...")
    async with AsyncSessionLocal() as session:
        # Check if catches already exist to avoid duplication
        result = await session.execute(select(func.count(Catch.id)))
        count = result.scalar()
        if count > 0:
            print(f"Catch table already has {count} entries. Skipping seeding.")
            return

        # Fetch Fish
        result = await session.execute(select(Fish))
        fishes = result.scalars().all()

        if not fishes:
            print("No fish found in DB. Please seed fish first.")
            return

        # Fetch Sessions
        result = await session.execute(select(Session))
        sessions = result.scalars().all()

        if not sessions:
            print("No sessions found in DB. Please create sessions first.")
            return

        catches_to_add = []
        print(f"Found {len(sessions)} sessions and {len(fishes)} fish types.")

        for sess in sessions:
            # 50% chance to have catches in a session
            if random.random() > 0.5:
                continue

            num_catches = random.randint(1, 3)
            for _ in range(num_catches):
                fish = random.choice(fishes)
                # Ensure catch time is within session
                catch_time = sess.entry_time + timedelta(minutes=random.randint(5, 60))

                new_catch = Catch(
                    user_id=sess.user_id,
                    fish_id=fish.id,
                    session_id=sess.id,
                    weight=round(random.uniform(0.5, 5.0), 2),  # kg
                    free_text=f"Nice {fish.en_name}",
                    catch_time=catch_time,
                )
                catches_to_add.append(new_catch)

        if catches_to_add:
            session.add_all(catches_to_add)
            await session.commit()
            print(f"Successfully added {len(catches_to_add)} catches.")
        else:
            print("No catches were generated.")


if __name__ == "__main__":
    asyncio.run(seed_catches())
