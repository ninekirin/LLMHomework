# -*- encoding: utf-8 -*-

from . import db
from .base import Base

class Course(Base):

    __tablename__ = 'course'

    course_code = db.Column(db.String(255), unique=True, nullable=False)
    course_name = db.Column(db.String(255), nullable=False)
    course_category = db.Column(db.String(255), nullable=False)

    def __init__(self, course_code, course_name, course_category):
        super(Course, self).__init__()
        self.course_code = course_code
        self.course_name = course_name
        self.course_category = course_category

    def to_dict(self):
        return {
            "id": self.id,
            "course_code": self.course_code,
            "course_name": self.course_name,
            "course_category": self.course_category
        }

    @classmethod
    def get_course_by_id(cls, course_id):
        return cls.query.filter_by(id=course_id).first()
    
    @classmethod
    def get_course_by_code(cls, course_code):
        # Capitalize the course code
        course_code = course_code.upper()
        return cls.query.filter_by(course_code=course_code).first()
    
    @classmethod
    def get_course_by_name(cls, course_name):
        return cls.query.filter_by(course_name=course_name).first()
    
    @classmethod
    def get_course_by_category(cls, course_category):
        return cls.query.filter_by(course_category=course_category).first()
    
    @classmethod
    def get_courses_by_name_or_code(cls, keyword):
        return cls.query.filter(cls.course_name.ilike(f"%{keyword}%") | cls.course_code.ilike(f"%{keyword}%")).all()

    @classmethod
    def get_courses_by_name_or_code_paginated(cls, course_name_or_code, page, per_page):
        result = cls.query.filter(cls.course_name.ilike(f"%{course_name_or_code}%") | cls.course_code.ilike(f"%{course_name_or_code}%")).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_all_courses(cls):
        return cls.query.all()
    
    @classmethod
    def get_all_courses_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_courses_by_ids(cls, ids):
        return cls.query.filter(cls.id.in_(ids)).all()

    @classmethod
    def add_course(cls, course_code, course_name, course_category):
        course = cls(course_code, course_name, course_category)
        cls.save(course)
        return course

    @classmethod
    def delete_course(cls, course_id):
        course = cls.query.filter_by(id=course_id).first()
        if course:
            cls.delete(course)
            return True
        return False
    
    @classmethod
    def update_course(cls, course_id, course_code, course_name, course_category):
        course = cls.query.filter_by(id=course_id).first()
        if course:
            course.course_code = course_code
            course.course_name = course_name
            course.course_category = course_category
            cls.save(course)
            return course.to_dict()
        return None
    
