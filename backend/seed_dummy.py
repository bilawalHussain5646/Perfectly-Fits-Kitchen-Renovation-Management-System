"""
seed_dummy.py — Insert 70 dummy invoice records for testing.
Run from the backend folder (with venv active):
    python seed_dummy.py
"""

import random
from datetime import datetime, timedelta
from app import app, db
from models import Invoice

# ── Sample data pools ──────────────────────────────────────────────────────
AR_NAMES = [
    "أحمد محمد", "فاطمة علي", "محمد عبدالله", "نورة سعد", "خالد عمر",
    "مريم يوسف", "عبدالرحمن حسن", "لطيفة جاسم", "سلطان راشد", "هند إبراهيم",
    "يوسف ناصر", "عائشة أحمد", "عمر سالم", "شيخة محمد", "إبراهيم خليل",
    "ريم عبدالله", "جاسم حمد", "دانة سعيد", "رشيد مبارك", "منى طارق",
    "حمد سلطان", "أسماء فيصل", "ماجد ناصر", "وفاء حسين", "فيصل جابر",
    "زينب علي", "سعيد عمر", "نجلاء محمد", "طارق راشد", "بشرى حمد",
]

EN_NAMES = [
    "James Carter", "Sarah Mitchell", "David Thompson", "Emily Watson", "Michael Brown",
    "Jessica Taylor", "Robert Johnson", "Amanda White", "William Harris", "Stephanie Lee",
    "Christopher Moore", "Melissa Martin", "Daniel Jackson", "Ashley Garcia", "Matthew Wilson",
    "Nicole Anderson", "Joshua Thomas", "Brittany Martinez", "Andrew Robinson", "Samantha Clark",
    "Ryan Lewis", "Heather Walker", "Brandon Hall", "Megan Allen", "Tyler Young",
    "Lauren King", "Ethan Scott", "Kayla Green", "Nathan Adams", "Rachel Baker",
    "Justin Nelson", "Hannah Hill", "Aaron Ramirez", "Victoria Rivera", "Zachary Campbell",
    "Alexis Mitchell", "Sean Roberts", "Danielle Cook", "Kyle Morgan", "Amber Bell",
]

DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "live.com", "mail.com",
]

def random_email(name: str) -> str:
    slug = (
        name.replace(" ", ".")
            .replace("أ","a").replace("ا","a").replace("إ","i")
            .replace("م","m").replace("ح","h").replace("ن","n")
            .replace("ف","f").replace("ع","a").replace("ي","y")
            .replace("ة","a").replace("خ","kh").replace("ل","l")
            .replace("س","s").replace("د","d").replace("ر","r")
            .replace("ك","k").replace("ب","b").replace("و","w")
            .replace("ج","j").replace("ق","q").replace("ط","t")
            .replace("ز","z").replace("ش","sh").replace("ص","s")
            .replace("ت","t").replace("ه","h").replace("ى","a")
            .replace("ض","d").replace("غ","g").replace("ظ","z")
        + str(random.randint(10, 999))
    )
    return f"{slug}@{random.choice(DOMAINS)}"

def random_phone() -> str:
    prefix = random.choice(["050", "055", "056", "058", "059", "054", "052", "070", "071"])
    return prefix + str(random.randint(1000000, 9999999))

def random_date() -> datetime:
    """Random date within the last 90 days."""
    days_ago = random.randint(0, 90)
    hour = random.randint(8, 22)
    minute = random.randint(0, 59)
    return datetime.utcnow() - timedelta(days=days_ago, hours=hour, minutes=minute)

EMIRATES = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
]

def run():
    all_names = AR_NAMES + EN_NAMES  
    random.shuffle(all_names)

    with app.app_context():
        added = 0
        for name in all_names[:70]:
            participation_date = random_date()
            invoice = Invoice(
                name=name,
                email=random_email(name),
                contact_number=random_phone(),
                participation_date=participation_date,
                emirate=random.choice(EMIRATES),
                invoice_image=None,
                is_giveaway_eligible=random.random() > 0.6,   # ~40% eligible
                marketing_consent=random.random() > 0.3,      # ~70% consented
                created_at=participation_date + timedelta(minutes=random.randint(5, 60)),
            )
            db.session.add(invoice)
            added += 1

        db.session.commit()
        print(f"✅  {added} dummy records inserted successfully.")

if __name__ == "__main__":
    run()
