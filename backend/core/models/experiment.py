# -*- encoding: utf-8 -*-

from . import db
from .base import Base

class Experiment(Base):

    __tablename__ = 'experiment'

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    experiment_text = db.Column(db.Text())
    is_answer = db.Column(db.Boolean, default=False)

    def __init__(self, user_id, question_id, experiment_text, is_answer):
        super(Experiment, self).__init__()
        self.user_id = user_id
        self.question_id = question_id
        self.experiment_text = experiment_text
        self.is_answer = is_answer

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question_id': self.question_id,
            'experiment_text': self.experiment_text,
            'is_answer': self.is_answer
        }

    @classmethod
    def get_experiment_by_id(cls, experiment_id):
        return cls.query.filter_by(id=experiment_id).first()

    @classmethod
    def get_experiments_by_user_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()
    
    @classmethod
    def get_experiments_by_user_id_paginated(cls, user_id, page, per_page):
        result = cls.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_experiments_by_question_id(cls, question_id):
        return cls.query.filter_by(question_id=question_id).all()
    
    @classmethod
    def get_experiments_by_question_id_paginated(cls, question_id, page, per_page):
        result = cls.query.filter_by(question_id=question_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_user_experiments_by_question_id_paginated(cls, user_id, question_id, page, per_page):
        result = cls.query.filter_by(user_id=user_id, question_id=question_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_user_experiments_paginated(cls, user_id, page, per_page):
        result = cls.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def add_experiment(cls, user_id, question_id, experiment_text, is_answer):
        experiment = cls(user_id, question_id, experiment_text, is_answer)
        cls.save(experiment)
        return experiment
    
    @classmethod
    def delete_experiment(cls, experiment_id):
        experiment = cls.query.filter_by(id=experiment_id).first()
        if experiment:
            cls.delete(experiment)
            return True
        return False
    
    @classmethod
    def update_experiment(cls, experiment_id, experiment_text):
        experiment = cls.query.filter_by(id=experiment_id).first()
        if experiment:
            experiment.experiment_text = experiment_text
            cls.save(experiment)
            return experiment
        return None
    
    @classmethod
    def update_experiment_is_answer(cls, experiment_id, is_answer):
        experiment = cls.query.filter_by(id=experiment_id).first()
        if experiment:
            experiment.is_answer = is_answer
            cls.save(experiment)
            return True
        return False