from . import db
from .base import Base

request_status_enum = db.Enum('PENDING', 'APPROVED', 'REJECTED', 'REVOKED', name='request_status_enum', default='PENDING')
request_type_enum = db.Enum('ADD_COURSE', 'UPDATE_SCORE', 'ADD_EXPERIMENT', name='request_type_enum', default=None)

class Request(Base):
    __tablename__ = 'request'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    request_type = db.Column(request_type_enum, nullable=False)
    request_status = db.Column(request_status_enum, nullable=False)
    request_explanation = db.Column(db.Text())

    __mapper_args__ = {
        'polymorphic_identity': 'request',
        'polymorphic_on': request_type
    }

    def __init__(self, user_id, request_type, request_status, request_explanation):
        super(Request, self).__init__()
        self.user_id = user_id
        self.request_type = request_type
        self.request_status = request_status
        self.request_explanation = request_explanation

    @classmethod
    def get_request_by_id(cls, request_id):
        return cls.query.filter_by(id=request_id).first()

    @classmethod
    def get_requests_paginated(cls, page, per_page, desc=False):
        if desc:
            result = cls.query.order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_requests_by_type_paginated(cls, request_type, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(request_type=request_type).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(request_type=request_type).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_requests_by_status_paginated(cls, request_status, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(request_status=request_status).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(request_status=request_status).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_requests_by_type_and_status_paginated(cls, request_type, request_status, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(request_type=request_type, request_status=request_status).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(request_type=request_type, request_status=request_status).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_user_requests_paginated(cls, user_id, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(user_id=user_id).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_user_requests_by_type_paginated(cls, user_id, request_type, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(user_id=user_id, request_type=request_type).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(user_id=user_id, request_type=request_type).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_user_requests_by_status_paginated(cls, user_id, status, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(user_id=user_id, request_status=status).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(user_id=user_id, request_status=status).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_user_requests_by_type_and_status_paginated(cls, user_id, request_type, request_status, page, per_page, desc=False):
        if desc:
            result = cls.query.filter_by(user_id=user_id, request_type=request_type, request_status=request_status).order_by(cls.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            result = cls.query.filter_by(user_id=user_id, request_type=request_type, request_status=request_status).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def delete_request(cls, request_id):
        request = cls.query.filter_by(id=request_id).first()
        if request:
            cls.delete(request)
            return True
        return False
    
    @classmethod
    def update_request_status(cls, request_id, new_status):
        request = cls.query.filter_by(id=request_id).first()
        if request:
            request.request_status = new_status
            cls.save(request)
            return True
        return False
    
    @classmethod
    def update_request_explanation(cls, request_id, new_explanation):
        request = cls.query.filter_by(id=request_id).first()
        if request:
            request.request_explanation = new_explanation
            cls.save(request)
            return True
        return False
    
    @classmethod
    def add_request(cls, user_id, request_type, request_status, request_explanation):
        request = Request(user_id=user_id, request_type=request_type, request_status=request_status, request_explanation=request_explanation)
        cls.save(request)
        return request

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'request_type': self.request_type,
            'request_status': self.request_status,
            'request_explanation': self.request_explanation
        }
