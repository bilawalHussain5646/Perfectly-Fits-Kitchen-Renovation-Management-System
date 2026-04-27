from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.dialects.mysql import LONGBLOB

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_super_admin = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'is_super_admin': self.is_super_admin
        }

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    participation_date = db.Column(db.DateTime, nullable=False)
    emirate = db.Column(db.String(100), nullable=False)
    invoice_image = db.Column(db.String(500), nullable=True)
    invoice_image_data = db.Column(LONGBLOB, nullable=True)
    is_giveaway_eligible = db.Column(db.Boolean, default=False, nullable=False)
    marketing_consent = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'contact_number': self.contact_number,
            'participation_date': self.participation_date.isoformat() if self.participation_date else None,
            'emirate': self.emirate,
            'invoice_image': self.invoice_image,
            'is_giveaway_eligible': self.is_giveaway_eligible,
            'marketing_consent': self.marketing_consent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class GiveawayWinner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=True)
    winner_name = db.Column(db.String(100), nullable=False)
    winner_email = db.Column(db.String(120), nullable=False)
    winner_contact = db.Column(db.String(20), nullable=False)
    winner_emirate = db.Column(db.String(100), nullable=True)
    drawn_at = db.Column(db.DateTime, default=datetime.utcnow)

    invoice = db.relationship('Invoice', backref='giveaway_wins', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'winner_name': self.winner_name,
            'winner_email': self.winner_email,
            'winner_contact': self.winner_contact,
            'winner_emirate': self.winner_emirate,
            'drawn_at': self.drawn_at.isoformat() if self.drawn_at else None
        }
class SystemSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Boolean, default=True, nullable=False)
    category = db.Column(db.String(50), nullable=False) # 'page' or 'dashboard_element'
    label = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'category': self.category,
            'label': self.label
        }
