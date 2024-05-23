# -*- encoding: utf-8 -*-

from . import db
from .base import Base
from .course import Course

question_category_enum = db.Enum('MATH', 'PROG', 'WRITING', name='question_category_enum')

class Question(Base):
    
    __tablename__ = 'question'
    
    question_text = db.Column(db.Text())
    question_category = db.Column(question_category_enum)
    question_score = db.Column(db.Float())
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))

    def __init__(self, question_text, question_category, question_score, course_id):
        super(Question, self).__init__()
        self.question_text = question_text
        self.question_category = question_category
        self.question_score = question_score
        self.course_id = course_id

    def get_question_text(self):
        return self.question_text
    
    def set_question_text(self, question_text):
        self.question_text = question_text

    def get_question_category(self):
        return self.question_category
    
    def set_question_category(self, question_category):
        self.question_category = question_category

    def get_question_score(self):
        return self.question_score
    
    def set_question_score(self, question_score):
        self.question_score = question_score

    def to_dict(self):
        return {
            "id": self.id,
            "question_text": self.question_text,
            "question_category": self.question_category,
            "question_score": self.question_score,
            "course_id": self.course_id
        }

    @classmethod
    def get_question_by_id(cls, question_id):
        return cls.query.filter_by(id=question_id).first()
    
    @classmethod
    def get_questions_by_course_name_or_code_paginated(cls, course_name_or_code, page, per_page):
        result = cls.query.join(Course).filter(
            Course.course_code.ilike(f"%{course_name_or_code}%") |
            Course.course_name.ilike(f"%{course_name_or_code}%")
        ).paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def get_questions_by_course_category_paginated(cls, course_category, page, per_page):
        result = cls.query.join(Course).filter(Course.course_category==course_category).paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def get_questions_by_score_paginated(cls, question_score, page, per_page):
        result = cls.query.filter_by(question_score=question_score).paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def get_questions_by_keyword_paginated(cls, keyword, page, per_page):
        result = cls.query.filter(cls.question_text.ilike(f"%{keyword}%")).paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def get_all_questions_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def add_question(cls, question_text, question_category, question_score, course_id):
        question = cls(question_text, question_category, question_score, course_id)
        cls.save(question)
        return question

    @classmethod
    def delete_question(cls, question_id):
        question = cls.query.filter_by(id=question_id).first()
        if question:
            cls.delete(question)
            return True
        return False

    @classmethod
    def update_question(cls, question_id, question_text, question_category, question_score):
        question = cls.query.filter_by(id=question_id).first()
        if question:
            question.question_text = question_text
            question.question_category = question_category
            question.question_score = question_score
            cls.save(question)
            return question
