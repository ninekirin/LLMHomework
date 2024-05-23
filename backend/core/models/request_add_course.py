# -*- encoding: utf-8 -*-

from . import db
from .request import Request

class RequestAddCourse(Request):
    __tablename__ = 'request_add_course'

    request_id = db.Column(db.Integer, db.ForeignKey('request.id'), primary_key=True)
    course_code = db.Column(db.String(255), nullable=False)
    course_name = db.Column(db.String(255), nullable=False)
    course_category = db.Column(db.String(255), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'ADD_COURSE',
    }

    def __init__(self, user_id, request_status, request_explanation, course_code, course_name, course_category):
        super(RequestAddCourse, self).__init__(user_id, 'ADD_COURSE', request_status, request_explanation)
        self.course_code = course_code
        self.course_name = course_name
        self.course_category = course_category

    def to_dict(self):
        base_dict = super(RequestAddCourse, self).to_dict()
        base_dict.update({
            'course_code': self.course_code,
            'course_name': self.course_name,
            'course_category': self.course_category
        })
        return base_dict

    @classmethod
    def add_course_request(cls, user_id, request_status, request_explanation, course_code, course_name, course_category):
        request = RequestAddCourse(user_id=user_id, request_status=request_status,
                                   request_explanation=request_explanation, course_code=course_code,
                                   course_name=course_name, course_category=course_category)
        cls.save(request)
        return request
