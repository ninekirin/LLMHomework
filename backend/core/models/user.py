# -*- encoding: utf-8 -*-

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from .base import Base

user_type_enum = db.Enum('ADMIN', 'TEACHER', 'STUDENT', name='user_type_enum', default='STUDENT')
account_status_enum = db.Enum('ACTIVE', 'INACTIVE', name='account_status_enum', default='ACTIVE')

class User(Base):
    
    __tablename__ = 'user'

    username = db.Column(db.String(32), unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    user_type = db.Column(user_type_enum, nullable=False)
    account_status = db.Column(account_status_enum, nullable=False)
    jwt_auth_active = db.Column(db.Boolean())
    last_online = db.Column(db.DateTime())

    def __init__(self, username, email, password, user_type, account_status):
        super(User, self).__init__()
        self.username = username
        self.email = email
        self.password = generate_password_hash(password)
        self.user_type = user_type
        self.account_status = account_status

    def get_id(self):
        return self.id

    def get_username(self):
        return self.username
    
    def set_username(self, username):
        self.username = username
        
    def get_email(self):
        return self.email

    def set_email(self, email):
        self.email = email
        
    def check_password(self, password):
        return check_password_hash(self.password, password)

    def set_password(self, password):
        self.password = generate_password_hash(password)
        
    def get_user_type(self):
        return self.user_type

    def set_user_type(self, user_type):
        self.user_type = user_type

    def get_account_status(self):
        return self.account_status
        
    def set_account_status(self, account_status):
        self.account_status = account_status

    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status

    def get_last_online(self):
        return self.last_online

    def set_last_online(self):
        self.last_online = datetime.now()

    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'user_type': self.user_type,
            'account_status': self.account_status,
            # last_online format: 'YYYY-MM-DD HH:MM:SS'
            'last_online': self.last_online.strftime('%Y-%m-%d %H:%M:%S') if self.last_online else None
        }

    @classmethod
    def register(cls, username, email, password, user_type, account_status):
        user = cls(username, email, password, user_type, account_status)
        try:
            cls.save(user)
            return True
        except Exception as e:
            print(e)
            return False
        
    @classmethod
    def delete_user(cls, id):
        user = cls.get_by_id(id)
        if user:
            cls.delete(user)
            return True
        return False
        
    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def get_by_id(cls, user_id):
        return cls.query.filter_by(id=user_id).first()
    
    @classmethod
    def get_by_username(cls, username):
        return cls.query.filter_by(username=username).first()
    
    @classmethod
    def get_all_users_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total