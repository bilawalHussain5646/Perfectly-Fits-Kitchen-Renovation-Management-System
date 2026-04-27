import os
import io
import random
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from models import db, Invoice, User, GiveawayWinner, SystemSetting
import pandas as pd
from datetime import datetime, timedelta
import json
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt

app = Flask(__name__)

# CORS - frontend domain and api subdomain
CORS(app, expose_headers=['Content-Disposition'], origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://perfectly-fits-ramadan-promotion.com",
    "https://lg.com",
    "https://wwwstg.lg.com",
    "https://www.perfectly-fits-ramadan-promotion.com",
    "https://wwwstg.lg.com/ae/built-in-appliances/perfectly-fits-kitchen-renovation",
    "https://wwwstg.lg.com/ae_ar/built-in-appliances/perfectly-fits-kitchen-renovation",
    "https://www.lg.com/ae/built-in-appliances/perfectly-fits-kitchen-renovation",
    "https://www.lg.com/ae_ar/built-in-appliances/perfectly-fits-kitchen-renovation"
])

# Configuration - reads from environment variables (set in cPanel or .env)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    # ''
)
# Force utf8mb4 at the connection level so Arabic/Unicode is saved correctly
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {
        'charset': 'utf8mb4'
    }
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
# app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', '')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


jwt = JWTManager(app)

# Initialize DB
db.init_app(app)

with app.app_context():
    db.create_all()
    # Seed super admin if no super admin exists
    if not User.query.filter_by(is_super_admin=True).first():
        existing = User.query.filter_by(username='admin').first()
        if existing:
            existing.is_super_admin = True
        else:
            hashed = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            super_admin = User(username='admin', password_hash=hashed, is_super_admin=True)
            db.session.add(super_admin)
        db.session.commit()
        print('Super admin seeded (username: admin, password: admin123)')

    # Seed default system settings
    default_settings = [
        # Pages
        {'key': 'show_dashboard_page', 'value': True, 'category': 'page', 'label': 'Dashboard Page'},
        {'key': 'show_create_invoice_page', 'value': True, 'category': 'page', 'label': 'Create Invoice Page'},
        {'key': 'show_invoices_page', 'value': True, 'category': 'page', 'label': 'Entries Page'},
        {'key': 'show_giveaway_page', 'value': True, 'category': 'page', 'label': 'Giveaway Page'},
        {'key': 'show_settings_page', 'value': True, 'category': 'page', 'label': 'Settings Page'},

        # Dashboard Elements
        {'key': 'show_total_records_card', 'value': True, 'category': 'dashboard_element', 'label': 'Total Records Card'},
        {'key': 'show_above_7000_card', 'value': True, 'category': 'dashboard_element', 'label': 'Above $7,000 Card'},
        {'key': 'show_participants_card', 'value': True, 'category': 'dashboard_element', 'label': 'Participants Card'},
        {'key': 'show_price_distribution_chart', 'value': True, 'category': 'dashboard_element', 'label': 'Price Distribution Chart'},
        {'key': 'show_monthly_trend_chart', 'value': True, 'category': 'dashboard_element', 'label': 'Monthly Trend Chart'}
    ]
    
    for s in default_settings:
        if not SystemSetting.query.filter_by(key=s['key']).first():
            setting = SystemSetting(key=s['key'], value=s['value'], category=s['category'], label=s['label'])
            db.session.add(setting)
    db.session.commit()


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    print(username,password)
    print("real password: ", password.encode('utf-8'))
    print("hashed password: ", user.password_hash.encode('utf-8'))
    print(bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')))
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        access_token = create_access_token(identity=username)
        return jsonify({
            'access_token': access_token,
            'username': user.username,
            'is_super_admin': user.is_super_admin
        }), 200
    print(user)
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@app.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password required'}), 400
    
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.password_hash = hashed_password
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    username = get_jwt_identity()
    current_user = User.query.filter_by(username=username).first()
    if not current_user or not current_user.is_super_admin:
        return jsonify({'error': 'Access denied'}), 403
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@app.route('/api/users', methods=['POST'])
@jwt_required()
def create_user():
    username = get_jwt_identity()
    current_user = User.query.filter_by(username=username).first()
    if not current_user or not current_user.is_super_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.json
    new_username = data.get('username')
    new_password = data.get('password')
    
    if not new_username or not new_password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if User.query.filter_by(username=new_username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = User(username=new_username, password_hash=hashed_password, is_super_admin=False)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user': new_user.to_dict()}), 201

@app.route('/api/users/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    username = get_jwt_identity()
    current_user = User.query.filter_by(username=username).first()
    if not current_user or not current_user.is_super_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    user_to_delete = User.query.get_or_404(id)
    
    if user_to_delete.is_super_admin:
        return jsonify({'error': 'Cannot delete super admin'}), 400
    
    if user_to_delete.id == current_user.id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    db.session.delete(user_to_delete)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'}), 200

@app.route('/api/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    try:
        data = request.form
        file = request.files.get('invoice_image')

        image_binary = None
        image_path = None
        if file:
            filename = secure_filename(file.filename)
            unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
            full_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image_binary = file.read()
            with open(full_path, 'wb') as f:
                f.write(image_binary)
            image_path = unique_filename

        marketing_consent = data.get('marketing_consent') == 'true'

        new_invoice = Invoice(
            name=data.get('name'),
            email=data.get('email'),
            contact_number=data.get('contact_number'),
            participation_date=datetime.fromisoformat(data.get('participation_date')),
            emirate=data.get('emirate'),
            invoice_image=image_path,
            invoice_image_data=image_binary,
            marketing_consent=marketing_consent
        )
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice created successfully!', 'invoice': new_invoice.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/upload-invoices', methods=['POST'])
# @jwt_required()
def upload_invoice():
    try:
        data = request.form
        file = request.files.get('invoice_image')

        image_binary = None
        image_path = None
        if file:
            filename = secure_filename(file.filename)
            unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
            full_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            image_binary = file.read()
            with open(full_path, 'wb') as f:
                f.write(image_binary)
            image_path = unique_filename

        marketing_consent = data.get('marketing_consent') == 'true'

        new_invoice = Invoice(
            name=data.get('name'),
            email=data.get('email'),
            contact_number=data.get('contact_number'),
            participation_date=datetime.fromisoformat(data.get('participation_date')),
            emirate=data.get('emirate'),
            invoice_image=image_path,
            invoice_image_data=image_binary,
            marketing_consent=marketing_consent
        )
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice created successfully!', 'invoice': new_invoice.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    try:
        query = Invoice.query
        name = request.args.get('name')
        if name:
            query = query.filter(Invoice.name.ilike(f"%{name}%"))
        email = request.args.get('email')
        if email:
            query = query.filter(Invoice.email.ilike(f"%{email}%"))
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        if start_date:
             query = query.filter(Invoice.created_at >= datetime.fromisoformat(start_date))
        if end_date:
             query = query.filter(Invoice.created_at <= datetime.fromisoformat(end_date))
        invoices = query.order_by(Invoice.id.desc()).all()
        return jsonify([inv.to_dict() for inv in invoices]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(id):
    try:
        invoice = Invoice.query.get_or_404(id)
        if invoice.invoice_image:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], invoice.invoice_image)
            if os.path.exists(file_path):
                os.remove(file_path)
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<int:id>/giveaway', methods=['PUT'])
@jwt_required()
def toggle_giveaway(id):
    try:
        invoice = Invoice.query.get_or_404(id)
        invoice.is_giveaway_eligible = not invoice.is_giveaway_eligible
        db.session.commit()
        return jsonify({
            'message': f'Giveaway eligibility {"enabled" if invoice.is_giveaway_eligible else "disabled"}',
            'invoice': invoice.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/giveaway/eligible', methods=['GET'])
@jwt_required()
def get_giveaway_eligible():
    try:
        eligible = Invoice.query.filter_by(is_giveaway_eligible=True).all()
        return jsonify([inv.to_dict() for inv in eligible]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/giveaway/random-winner', methods=['GET'])
@jwt_required()
def random_winner():
    try:
        eligible = Invoice.query.filter_by(is_giveaway_eligible=True).all()
        if not eligible:
            return jsonify({'error': 'No eligible participants'}), 400
        winner = random.choice(eligible)
        history_entry = GiveawayWinner(
            invoice_id=winner.id,
            winner_name=winner.name,
            winner_email=winner.email,
            winner_contact=winner.contact_number,
            winner_emirate=winner.emirate
        )
        db.session.add(history_entry)
        db.session.commit()
        return jsonify({'winner': winner.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/giveaway/history', methods=['GET'])
@jwt_required()
def giveaway_history():
    try:
        history = GiveawayWinner.query.order_by(GiveawayWinner.drawn_at.desc()).all()
        return jsonify([entry.to_dict() for entry in history]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        total = Invoice.query.count()
        giveaway_participants = Invoice.query.filter_by(is_giveaway_eligible=True).count()
        with_receipts = Invoice.query.filter(Invoice.invoice_image != None).count()
        
        monthly_data = []
        now = datetime.utcnow()
        for i in range(5, -1, -1):
            month_start = datetime(now.year, now.month, 1) - timedelta(days=i * 30)
            month_end = month_start + timedelta(days=30)
            count = Invoice.query.filter(
                Invoice.created_at >= month_start,
                Invoice.created_at < month_end
            ).count()
            monthly_data.append({'label': month_start.strftime('%b'), 'count': count})
        
        return jsonify({
            'total': total,
            'giveaway_participants': giveaway_participants,
            'with_receipts': with_receipts,
            'monthly_trend': monthly_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export', methods=['GET'])
@jwt_required()
def export_invoices():
    try:
        import zipfile
        from datetime import datetime as dt
        
        query = Invoice.query
        name = request.args.get('name')
        email = request.args.get('email')
        if name:
            query = query.filter(Invoice.name.ilike(f"%{name}%"))
        if email:
            query = query.filter(Invoice.email.ilike(f"%{email}%"))

        invoices = query.all()
        # Custom data to include new fields and remove binary/price
        data = []
        for inv in invoices:
            data.append({
                'ID': inv.id,
                'Full Name': inv.name,
                'Email Address': inv.email,
                'Mobile Number': inv.contact_number,
                'Participating Emirate': inv.emirate,
                'Date of Participation': inv.participation_date.isoformat() if inv.participation_date else '',
                'Marketing Consent': inv.marketing_consent,
                'Created At': inv.created_at.isoformat() if inv.created_at else ''
            })
        df = pd.DataFrame(data)
        
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False, engine='openpyxl')
        excel_buffer.seek(0)
        
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            zip_file.writestr('invoices.xlsx', excel_buffer.getvalue())
            for invoice in invoices:
                if invoice.invoice_image_data:
                    ext = '.jpg'
                    if invoice.invoice_image:
                        _, detected_ext = os.path.splitext(invoice.invoice_image)
                        if detected_ext:
                            ext = detected_ext
                    image_filename = f"images/invoice_{invoice.id}{ext}"
                    zip_file.writestr(image_filename, invoice.invoice_image_data)
        
        zip_buffer.seek(0)
        timestamp = dt.now().strftime('%Y%m%d_%H%M%S')
        download_name = f'invoices_export_{timestamp}.zip'
        
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=download_name
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/invoices/<int:id>/image')
@jwt_required()
def get_invoice_image(id):
    invoice = Invoice.query.get_or_404(id)
    if not invoice.invoice_image_data:
        return 'No image', 404
    return send_file(
        io.BytesIO(invoice.invoice_image_data),
        mimetype='image/jpeg',
        as_attachment=False,
        download_name=invoice.invoice_image
    )

@app.route('/api/settings/visibility', methods=['GET'])
@jwt_required()
def get_visibility_settings():
    settings = SystemSetting.query.all()
    return jsonify([s.to_dict() for s in settings]), 200

@app.route('/api/settings/visibility', methods=['POST'])
@jwt_required()
def update_visibility_settings():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user or not user.is_super_admin:
        return jsonify({'error': 'Super Admin access required'}), 403
    
    data = request.json
    for key, value in data.items():
        setting = SystemSetting.query.filter_by(key=key).first()
        if setting:
            setting.value = value
    
    db.session.commit()
    return jsonify({'message': 'Settings updated successfully'}), 200

if __name__ == '__main__':
    app.run(debug=False, port=5000)
