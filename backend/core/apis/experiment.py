# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import Experiment, Question

from .user import jwt_token_required, teacher_required

experiment_ns = Namespace(name="Experiment", description="Experiment related APIs")

"""
    Models
"""

add_experiment_model = experiment_ns.model('AddExperiment', {
    'question_id': fields.Integer(required=True, description="Question ID", example=1),
    'experiment_text': fields.String(required=True, description="Experiment text", example="The experiment text")
})

delete_experiment_model = experiment_ns.model('DeleteExperiment', {
    'id': fields.Integer(required=True, description="Experiment ID", example=1)
})

update_experiment_model = experiment_ns.model('UpdateExperiment', {
    'id': fields.Integer(required=True, description="Experiment ID", example=1),
    'experiment_text': fields.String(required=True, description="Experiment text", example="The experiment text")
})

"""
    Flask-Restx routes
"""

@experiment_ns.route("")
class ExperimentApi(Resource):
    @experiment_ns.expect(add_experiment_model)
    @jwt_token_required
    @teacher_required
    def post(self, cls):
        data = request.json

        question_id = data.get("question_id")
        experiment_text = data.get("experiment_text")

        if not question_id:
            return {"success": False, "code": "QUESTION_ID_MISSING", "message": "Question ID is required."}, HTTPStatus.BAD_REQUEST
        
        # Check if the question exists
        question = Question.get_question_by_id(question_id)
        if not question:
            return {"success": False, "code": "QUESTION_NOT_FOUND", "message": "Question not found. You can't add experiment to a non-existent question."}, HTTPStatus.NOT_FOUND
        
        if not experiment_text:
            return {"success": False, "code": "EXPERIMENT_TEXT_MISSING", "message": "Experiment text is required."}, HTTPStatus.BAD_REQUEST
        
        experiment = Experiment.add_experiment(self.id, question_id, experiment_text, False)

        if experiment:
            return {"success": True, "code": "EXPERIMENT_ADDED", "message": "Experiment added successfully.", "data": experiment.to_dict()}, HTTPStatus.CREATED


    @experiment_ns.param("id", "Experiment ID")
    @jwt_token_required
    @teacher_required
    def get(self, cls):
        data = request.args

        id = data.get("id")

        if id and id.isdigit():
            experiment = Experiment.get_experiment_by_id(id)
            if experiment:
                if experiment.user_id != self.id and not self.user_type == "ADMIN":
                    return {"success": False, "code": "NO_PERMISSION", "message": "You don't have permission to view this experiment."}, HTTPStatus.FORBIDDEN
                return {"success": True, "code": "SUCCESS", "message": "Experiment found.", "data": experiment.to_dict()}, HTTPStatus.OK
            else:
                return {"success": False, "code": "EXPERIMENT_NOT_FOUND", "message": "Experiment not found."}, HTTPStatus.NOT_FOUND
        elif id:
            return {"success": False, "code": "EXPERIMENT_ID_MISSING", "message": "Experiment ID is required."}, HTTPStatus.BAD_REQUEST
        

    @experiment_ns.expect(update_experiment_model)
    @jwt_token_required
    @teacher_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        experiment_text = data.get("experiment_text")

        if not id:
            return {"success": False, "code": "EXPERIMENT_ID_MISSING", "message": "Experiment ID is required."}, HTTPStatus.BAD_REQUEST
        
        if not experiment_text:
            return {"success": False, "code": "EXPERIMENT_TEXT_MISSING", "message": "Experiment text is required."}, HTTPStatus.BAD_REQUEST
        
        experiment = Experiment.update_experiment(id, experiment_text)

        if experiment:
            return {"success": True, "code": "EXPERIMENT_UPDATED", "message": "Experiment updated successfully.", "data": experiment.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "EXPERIMENT_UPDATE_FAILED", "message": "Failed to update experiment."}, HTTPStatus.INTERNAL_SERVER_ERROR


    @experiment_ns.expect(delete_experiment_model)
    @jwt_token_required
    @teacher_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")

        if not id:
            return {"success": False, "code": "EXPERIMENT_ID_MISSING", "message": "Experiment ID is required."}, HTTPStatus.BAD_REQUEST
        
        result = Experiment.delete_experiment(id)

        if result:
            return {"success": True, "code": "EXPERIMENT_DELETED", "message": "Experiment deleted successfully."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "EXPERIMENT_DELETE_FAILED", "message": "Failed to delete experiment."}, HTTPStatus.INTERNAL_SERVER_ERROR
        
@experiment_ns.route("s")
class ExperimentsApi(Resource):

    @experiment_ns.param("question_id", "Question ID")
    @experiment_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @experiment_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    @teacher_required
    def get(self, cls):
        data = request.args

        question_id = data.get("question_id")
        user_id = self.id

        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        if not question_id:
            experiments, total = Experiment.get_user_experiments_paginated(user_id, current, pageSize)
        else:
            experiments, total = Experiment.get_user_experiments_by_question_id_paginated(user_id, question_id, current, pageSize)
        
        return {"success": True, "code": "SUCCESS", "message": "SUCCESS.", "data": {"experiments": [experiment.to_dict() for experiment in experiments], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK