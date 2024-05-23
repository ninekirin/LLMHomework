# -*- encoding: utf-8 -*-

from . import db
from .request import Request

class RequestUpdateScore(Request):
    __tablename__ = 'request_update_score'
    
    request_id = db.Column(db.Integer, db.ForeignKey('request.id'), primary_key=True, nullable=False)
    answer_id = db.Column(db.Integer, db.ForeignKey('answer.id'), nullable=False)
    new_score = db.Column(db.Float(), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'UPDATE_SCORE',
    }

    def __init__(self, user_id, request_status, request_explanation, answer_id, new_score):
        super(RequestUpdateScore, self).__init__(user_id, 'UPDATE_SCORE', request_status, request_explanation)
        self.answer_id = answer_id
        self.new_score = new_score

    def to_dict(self):
        base_dict = super(RequestUpdateScore, self).to_dict()
        base_dict.update({
            'answer_id': self.answer_id,
            'new_score': self.new_score
        })
        return base_dict

    @classmethod
    def add_score_update_request(cls, user_id, request_status, request_explanation, answer_id, new_score):
        request = RequestUpdateScore(user_id=user_id, request_status=request_status,
                                     request_explanation=request_explanation,
                                     answer_id=answer_id, new_score=new_score)
        cls.save(request)
        return request

    @classmethod
    def get_request_by_answer_id(cls, answer_id):
        return cls.query.filter_by(answer_id=answer_id).first()