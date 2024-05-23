# -*- encoding: utf-8 -*-

from . import db
from .request import Request

class RequestAddExperiment(Request):
    __tablename__ = 'request_add_experiment'
    
    request_id = db.Column(db.Integer, db.ForeignKey('request.id'), primary_key=True)
    experiment_id = db.Column(db.Integer, db.ForeignKey('experiment.id'), nullable=False)
    llm_name = db.Column(db.String(255))
    comment = db.Column(db.Text())
    score = db.Column(db.Float())

    __mapper_args__ = {
        'polymorphic_identity': 'ADD_EXPERIMENT',
    }

    def __init__(self, user_id, request_status, request_explanation, experiment_id, llm_name, comment, score):
        super(RequestAddExperiment, self).__init__(user_id, 'ADD_EXPERIMENT', request_status, request_explanation)
        self.experiment_id = experiment_id
        self.llm_name = llm_name
        self.comment = comment
        self.score = score

    def to_dict(self):
        base_dict = super(RequestAddExperiment, self).to_dict()
        base_dict.update({
            'experiment_id': self.experiment_id,
            'llm_name': self.llm_name,
            'comment': self.comment,
            'score': self.score
        })
        return base_dict

    @classmethod
    def add_experiment_request(cls, user_id, request_status, request_explanation, experiment_id, llm_name, comment, score):
        request = RequestAddExperiment(user_id=user_id, request_status=request_status,
                                       request_explanation=request_explanation, experiment_id=experiment_id,
                                        llm_name=llm_name, comment=comment, score=score)
        cls.save(request)
        return request

    @classmethod
    def get_request_by_experiment_id(cls, experiment_id):
        return cls.query.filter_by(experiment_id=experiment_id).first()