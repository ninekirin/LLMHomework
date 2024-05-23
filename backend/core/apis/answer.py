# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import Answer, Course

from .user import jwt_token_required, admin_required

answer_ns = Namespace(name="Answer", description="Answer related APIs")

"""
    Models
"""

add_answer_model = answer_ns.model('AddAnswer', {
    'question_id': fields.Integer(required=True, description="Question ID", example=1),
    'llm_name': fields.String(description="LLM Name", example="John Doe"),
    'answer_text': fields.String(required=True, description="Answer text", example="Answer text"),
    'comment': fields.String(description="Comment", example="Comment"),
    'score': fields.Float(required=True, description="Score", example=4.5)
})

delete_answer_model = answer_ns.model('DeleteAnswer', {
    'answer_id': fields.Integer(required=True, description="Answer ID", example=1)
})

update_answer_model = answer_ns.model('UpdateAnswer', {
    'answer_id': fields.Integer(required=True, description="Answer ID", example=1),
    'llm_name': fields.String(description="LLM Name", example="John Doe"),
    'answer_text': fields.String(required=True, description="Answer text", example="Answer text"),
    'comment': fields.String(description="Comment", example="Comment")
})

update_score_model = answer_ns.model('UpdateScore', {
    # 'answer_id': fields.Integer(required=True, description="Answer ID", example=1),
    'score': fields.Float(required=True, description="Score", example=4.5)
})

"""
    Flask-Restx routes
"""

@answer_ns.route("")
class AnswerApi(Resource):
    @answer_ns.expect(add_answer_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        question_id = data.get("question_id")
        llm_name = data.get("llm_name")
        answer_text = data.get("answer_text")
        comment = data.get("comment")
        score = data.get("score")

        if not question_id:
            return {"success": False, "code": "QUESTION_ID_MISSING", "message": "Question ID is required."}, HTTPStatus.BAD_REQUEST
        
        if not answer_text:
            return {"success": False, "code": "ANSWER_TEXT_MISSING", "message": "Answer text is required."}, HTTPStatus.BAD_REQUEST
        
        if not score:
            return {"success": False, "code": "SCORE_MISSING", "message": "Score is required."}, HTTPStatus.BAD_REQUEST
        
        # add answer
        answer = Answer.add_answer(question_id, llm_name, answer_text, comment, score)

        if answer:
            return {"success": True, "code": "ANSWER_ADDED", "message": "Answer added successfully.", "data": answer.to_dict()}, HTTPStatus.CREATED
        
    
    @jwt_token_required
    @answer_ns.param("id", "Answer ID")
    def get(self, cls):
        data = request.args

        answer_id = data.get("id")

        if answer_id and answer_id.isdigit():
            answer = Answer.get_answer_by_id(answer_id)
            if answer:
                return {"success": True, "code": "ANSWER_FOUND", "message": "Answer found.", "data": answer.to_dict()}, HTTPStatus.OK
            return {"success": False, "code": "ANSWER_NOT_FOUND", "message": "Answer not found."}, HTTPStatus.NOT_FOUND
        return {"success": False, "code": "ANSWER_ID_MISSING", "message": "Answer ID is required."}, HTTPStatus.BAD_REQUEST
    
    @answer_ns.expect(delete_answer_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        answer_id = data.get("answer_id")

        if not answer_id:
            return {"success": False, "code": "ANSWER_ID_MISSING", "message": "Answer ID is required."}, HTTPStatus.BAD_REQUEST
        
        if Answer.delete_answer(answer_id):
            return {"success": True, "code": "ANSWER_DELETED", "message": "Answer deleted successfully."}, HTTPStatus.OK
        
        return {"success": False, "code": "ANSWER_NOT_DELETED", "message": "Answer not deleted."}, HTTPStatus.INTERNAL_SERVER_ERROR
    
    @answer_ns.expect(update_answer_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        answer_id = data.get("answer_id")
        llm_name = data.get("llm_name")
        answer_text = data.get("answer_text")
        comment = data.get("comment")

        if not answer_id:
            return {"success": False, "code": "ANSWER_ID_MISSING", "message": "Answer ID is required."}, HTTPStatus.BAD_REQUEST
        
        if not answer_text:
            return {"success": False, "code": "ANSWER_TEXT_MISSING", "message": "Answer text is required."}, HTTPStatus.BAD_REQUEST
        
        answer = Answer.update_answer(answer_id, llm_name, answer_text, comment)

        if answer:
            return {"success": True, "code": "ANSWER_UPDATED", "message": "Answer updated successfully.", "data": answer.to_dict()}, HTTPStatus.OK
        
        return {"success": False, "code": "ANSWER_UPDATE_FAILED", "message": "Failed to update answer."}, HTTPStatus.INTERNAL_SERVER_ERROR

@answer_ns.route("s")
class AnswersApi(Resource):
    @answer_ns.param("question_id", "Question ID")
    @answer_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @answer_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    def get(self, cls):
        data = request.args

        question_id = data.get("question_id")

        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        if question_id:
            answers, total = Answer.get_answers_by_question_id_paginated(question_id, current, pageSize)
            return {"success": True, "code": "SUCCESS", "message": "Success.", "data": {"answers": [answer.to_dict() for answer in answers], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK

        return {"success": False, "code": "QUESTION_ID_MISSING", "message": "Question ID is required."}, HTTPStatus.BAD_REQUEST

@answer_ns.route("/<int:answer_id>/score")
class AnswerScoreApi(Resource):
    
    @answer_ns.expect(update_score_model)
    @jwt_token_required
    @admin_required
    def post(self, cls, answer_id):
        data = request.json

        score = data.get("score")

        if not score:
            return {"success": False, "code": "SCORE_MISSING", "message": "Score is required."}, HTTPStatus.BAD_REQUEST
        
        answer = Answer.get_answer_by_id(answer_id)
        if not answer:
            return {"success": False, "code": "ANSWER_NOT_FOUND", "message": "Answer not found."}, HTTPStatus.NOT_FOUND
        
        answer = Answer.update_score(answer_id, score)

        if answer:
            return {"success": True, "code": "SCORE_UPDATED", "message": "Score updated successfully.", "data": answer.to_dict()}, HTTPStatus.OK
        
        return {"success": False, "code": "SCORE_UPDATE_FAILED", "message": "Failed to update score."}, HTTPStatus.INTERNAL_SERVER_ERROR