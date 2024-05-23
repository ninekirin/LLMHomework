# -*- encoding: utf-8 -*-

from . import db
from .base import Base

class Answer(Base):

    __tablename__ = 'answer'

    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    llm_name = db.Column(db.String(255))
    answer_text = db.Column(db.Text())
    comment = db.Column(db.Text())
    score = db.Column(db.Float())
    score_update_count = db.Column(db.Integer, default=1)

    def __init__(self, question_id, llm_name, answer_text, comment, score):
        super(Answer, self).__init__()
        self.question_id = question_id
        self.llm_name = llm_name
        self.answer_text = answer_text
        self.comment = comment
        self.score = score
        self.score_update_count = 1
    
    def to_dict(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "llm_name": self.llm_name,
            "answer_text": self.answer_text,
            "comment": self.comment,
            "score": self.score,
            "score_update_count": self.score_update_count
        }

    @classmethod
    def get_answer_by_id(cls, answer_id):
        return cls.query.filter_by(id=answer_id).first()
    
    @classmethod
    def get_answers_by_question_id(cls, question_id):
        return cls.query.filter_by(question_id=question_id).all()
    
    @classmethod
    def get_answers_by_question_id_paginated(cls, question_id, page, per_page):
        result = cls.query.filter_by(question_id=question_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_question_id_by_answer_id(cls, answer_id):
        answer = cls.query.filter_by(id=answer_id).first()
        if answer:
            return answer.question_id
        return None

    @classmethod
    def add_answer(cls, question_id, llm_name, answer_text, comment, score):
        answer = cls(question_id, llm_name, answer_text, comment, score)
        cls.save(answer)
        return answer

    @classmethod
    def delete_answer(cls, answer_id):
        answer = cls.query.filter_by(id=answer_id).first()
        if answer:
            cls.delete(answer)
            return True
        return False
    
    @classmethod
    def update_answer(cls, answer_id, llm_name, answer_text, comment):
        answer = cls.query.filter_by(id=answer_id).first()
        if answer:
            answer.llm_name = llm_name
            answer.answer_text = answer_text
            answer.comment = comment
            cls.save(answer)
            return answer
        return None

    @classmethod
    def update_score(cls, answer_id, score):
        answer = cls.query.filter_by(id=answer_id).first()
        # answer.score = score
        # get the average score
        answer.score = (answer.score * answer.score_update_count + score) / (answer.score_update_count + 1)
        answer.score_update_count += 1
        cls.save(answer)
        return answer