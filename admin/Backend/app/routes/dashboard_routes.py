from flask import Blueprint, jsonify, request
from app.database import db
from app.models.user import User
from sqlalchemy import func, text, extract
from datetime import datetime, timedelta
from app.models.payment import Payment
from app.models.bus_route import BusRoute
import uuid

dashboard_bp = Blueprint('dashboard', __name__)

def get_date_range(time_filter):
    now = datetime.now()
    if time_filter == 'today':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
    elif time_filter == 'month':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + timedelta(days=32)).replace(day=1)
    elif time_filter == 'year':
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date.replace(year=start_date.year + 1)
    else:
        # Mặc định là hôm nay
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
    
    return start_date, end_date

@dashboard_bp.route('/metrics', methods=['GET'])
def get_metrics():
    try:
        time_filter = request.args.get('time_filter', 'today')
        start_date, end_date = get_date_range(time_filter)
        
        # Tổng số hành khách
        total_passengers = db.session.query(func.count(User.cccd)).scalar()
        
        # Số chuyến (tạm thời lấy từ số lượng tuyến xe)
        today_trips = db.session.query(func.count(BusRoute.id)).scalar()
        
        # Thanh toán thành công (số giao dịch thành công)
        successful_payments = db.session.query(func.count(Payment.id)).filter(
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        ).scalar()
        
        # Doanh thu (tổng số tiền từ các giao dịch thành công)
        today_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        ).scalar() or 0
        
        return jsonify({
            'total_passengers': total_passengers,
            'today_trips': today_trips,
            'successful_payments': successful_payments,
            'today_revenue': float(today_revenue),
            'time_filter': time_filter
        })
    except Exception as e:
        print(f"Error in metrics: {str(e)}")
        return jsonify({
            'total_passengers': 0,
            'today_trips': 0,
            'successful_payments': 0,
            'today_revenue': 0,
            'time_filter': time_filter
        })

@dashboard_bp.route('/monthly-sales', methods=['GET'])
def get_monthly_sales():
    try:
        time_filter = request.args.get('time_filter', 'month')
        start_date, end_date = get_date_range(time_filter)
        
        # Lấy doanh thu theo tháng từ các giao dịch thành công
        monthly_sales = db.session.query(
            extract('month', Payment.paid_at).label('month'),
            func.sum(Payment.amount).label('total')
        ).filter(
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        ).group_by(
            extract('month', Payment.paid_at)
        ).all()
        
        # Chuyển đổi kết quả thành định dạng phù hợp
        sales_data = []
        for month, total in monthly_sales:
            month_name = datetime(2000, int(month), 1).strftime('%B')
            sales_data.append({
                'month': month_name,
                'total': float(total) if total else 0
            })
        
        return jsonify(sales_data)
    except Exception as e:
        print(f"Error in monthly sales: {str(e)}")
        return jsonify([])

@dashboard_bp.route('/statistics', methods=['GET'])
def get_statistics():
    try:
        time_filter = request.args.get('time_filter', 'month')
        start_date, end_date = get_date_range(time_filter)

        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        ).scalar() or 0

        revenue_by_bus = db.session.query(
            Payment.bus_license_plate,
            func.sum(Payment.amount)
        ).filter(
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        ).group_by(
            Payment.bus_license_plate
        ).all()

        count_by_bus = db.session.query(
            Payment.bus_license_plate,
            func.count(Payment.id)
        ).filter(
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        ).group_by(
            Payment.bus_license_plate
        ).all()

        return jsonify({
            'total_revenue': float(total_revenue),
            'revenue_by_bus': [{'bus': bus, 'revenue': float(rev) if rev else 0} for bus, rev in revenue_by_bus],
            'count_by_bus': [{'bus': bus, 'count': int(count)} for bus, count in count_by_bus],
            'passenger_types': [],
            'route_stats': [],
            'revenue_by_type': [],
            'revenue_by_route': [],
            'payment_counts_by_month': [],
            'revenue_by_type_per_month': [],
            'time_filter': time_filter
        })
    except Exception as e:
        print(f"Error in statistics: {str(e)}")
        return jsonify({
            'total_revenue': 0,
            'revenue_by_bus': [],
            'count_by_bus': [],
            'passenger_types': [],
            'route_stats': [],
            'revenue_by_type': [],
            'revenue_by_route': [],
            'payment_counts_by_month': [],
            'revenue_by_type_per_month': [],
            'time_filter': time_filter
        })

@dashboard_bp.route('/create-sample-data', methods=['POST'])
def create_sample_data():
    try:
        # Lấy một số user và route để tạo dữ liệu mẫu
        users = User.query.limit(5).all()
        routes = BusRoute.query.limit(3).all()
        
        if not users or not routes:
            return jsonify({'error': 'No users or routes found'}), 400
            
        # Tạo các giao dịch mẫu
        for user in users:
            for route in routes:
                # Tạo giao dịch nạp tiền thành công
                deposit = Payment(
                    id=str(uuid.uuid4()),
                    user_cccd=user.cccd,
                    amount=100000,
                    type='deposit',
                    status='success',
                    bus_license_plate=route.bus_license_plate,
                    paid_at=datetime.now() - timedelta(days=1)
                )
                db.session.add(deposit)
                
                # Tạo giao dịch trừ tiền thành công
                deduct = Payment(
                    id=str(uuid.uuid4()),
                    user_cccd=user.cccd,
                    amount=50000,
                    type='deduct',
                    status='success',
                    bus_license_plate=route.bus_license_plate,
                    paid_at=datetime.now()
                )
                db.session.add(deduct)
        
        db.session.commit()
        return jsonify({'message': 'Sample data created successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error creating sample data: {str(e)}")
        return jsonify({'error': str(e)}), 500 