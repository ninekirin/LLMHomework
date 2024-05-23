# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import Question, Course

from .user import admin_required, jwt_token_required

question_ns = Namespace(name="Question", description="Question related APIs")

"""
    Models
"""

add_question_model = question_ns.model('AddQuestion', {
    'question_text': fields.String(required=True, description="Question text", example="What is the output of the following code?"),
    'question_category': fields.String(required=True, description="Question category", example="PROG"),
    'question_score': fields.Float(required=True, description="Question score", example=100.0),
    'course_id': fields.Integer(required=True, description="Course ID", example=1)
})

delete_question_model = question_ns.model('DeleteQuestion', {
    'id': fields.Integer(required=True, description="Question ID", example=1)
})

update_question_model = question_ns.model('UpdateQuestion', {
    'id': fields.Integer(required=True, description="Question ID", example=1),
    'question_text': fields.String(required=True, description="Question text", example="What is the output of the following code?"),
    'question_category': fields.String(required=True, description="Question category", example="PROG"),
    'question_score': fields.Float(required=True, description="Question score", example=100.0)
})

"""
    Flask-Restx routes
"""

@question_ns.route("")
class QuestionApi(Resource):
    @question_ns.expect(add_question_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        question_text = data.get("question_text")
        question_category = data.get("question_category")
        question_score = data.get("question_score")
        course_code = data.get("course_code")

        if not question_text:
            return {"success": False, "code": "QUESTION_TEXT_MISSING", "message": "Question text is required."}, HTTPStatus.BAD_REQUEST
        
        if not question_category:
            return {"success": False, "code": "QUESTION_CATEGORY_MISSING", "message": "Question category is required."}, HTTPStatus.BAD_REQUEST
        elif question_category not in ["MATH", "PROG", "WRITING"]:
            return {"success": False, "code": "INVALID_QUESTION_CATEGORY", "message": "Invalid question category, valid categories are MATH, PROG, WRITING."}, HTTPStatus.BAD_REQUEST
        
        if not question_score:
            return {"success": False, "code": "QUESTION_SCORE_MISSING", "message": "Question score is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_code:
            return {"success": False, "code": "COURSE_ID_MISSING", "message": "Course ID is required."}, HTTPStatus.BAD_REQUEST
        
        course = Course.get_course_by_code(course_code)
        if not course:
            return {"success": False, "code": "COURSE_NOT_FOUND", "message": "Course not found."}, HTTPStatus.NOT_FOUND
        
        course_id = course.id

        # add question
        question = Question.add_question(question_text, question_category, question_score, course_id)

        if question:
            return {"success": True, "code": "QUESTION_ADDED", "message": "Question added successfully.", "data": question.to_dict()}, HTTPStatus.CREATED
        else:
            return {"success": False, "code": "QUESTION_ADD_FAILED", "message": "Failed to add question."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @question_ns.param("id", "Question ID")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        id = data.get("id")

        if id and id.isdigit():
            question = Question.get_question_by_id(id)
            if question:
                return {"success": True, "code": "SUCCESS", "message": "Success.", "data": question.to_dict()}, HTTPStatus.OK
            else:
                return {"success": False, "code": "QUESTION_NOT_FOUND", "message": "Question not found."}, HTTPStatus.NOT_FOUND
        elif id:
            return {"success": False, "code": "QUESTION_ID_MISSING", "message": "Question ID is required."}, HTTPStatus.BAD_REQUEST

    @question_ns.expect(update_question_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        question_text = data.get("question_text")
        question_category = data.get("question_category")
        question_score = data.get("question_score")

        if not id:
            return {"success": False, "code": "QUESTION_ID_MISSING", "message": "Question ID is required."}, HTTPStatus.BAD_REQUEST

        if not question_text:
            return {"success": False, "code": "QUESTION_TEXT_MISSING", "message": "Question text is required."}, HTTPStatus.BAD_REQUEST

        # check if question exists
        question = Question.get_question_by_id(id)
        if not question:
            return {"success": False, "code": "QUESTION_NOT_FOUND", "message": "Question not found."}, HTTPStatus.NOT_FOUND

        # update question
        question = Question.update_question(id, question_text, question_category, question_score)

        if question:
            return {"success": True, "code": "QUESTION_UPDATED", "message": "Question updated successfully.", "data": question.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "QUESTION_UPDATE_FAILED", "message": "Failed to update question."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @question_ns.expect(delete_question_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")

        if not id:
            return {"success": False, "code": "QUESTION_ID_MISSING", "message": "Question ID is required."}, HTTPStatus.BAD_REQUEST

        # check if question exists
        question = Question.get_question_by_id(id)
        if not question:
            return {"success": False, "code": "QUESTION_NOT_FOUND", "message": "Question not found."}, HTTPStatus.NOT_FOUND

        # delete question
        deleted = Question.delete_question(id)

        if deleted:
            return {"success": True, "code": "QUESTION_DELETED", "message": "Question deleted successfully."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "QUESTION_DELETE_FAILED", "message": "Failed to delete question."}, HTTPStatus.INTERNAL_SERVER_ERROR


@question_ns.route("s")
class QuestionsApi(Resource):
    @question_ns.param("keyword", "Search keyword")
    @question_ns.param("course_name_or_code", "Search by course name or code")
    @question_ns.param("category", "Search by category")
    @question_ns.param("score", "Search by score")
    @question_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @question_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    def get(self, cls):
        data = request.args

        keyword = data.get("keyword")
        course_name_or_code = data.get("course_name_or_code")
        course_category = data.get("course_category")
        score = data.get("score")

        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        if course_name_or_code:
            questions, total = Question.get_questions_by_course_name_or_code_paginated(course_name_or_code, current, pageSize)
        elif course_category:
            questions, total = Question.get_questions_by_course_category_paginated(course_category, current, pageSize)
        elif score:
            questions, total = Question.get_questions_by_score_paginated(score, current, pageSize)
        elif keyword:
            questions, total = Question.get_questions_by_keyword_paginated(keyword, current, pageSize)
        else:
            questions, total = Question.get_all_questions_paginated(current, pageSize)

        return {"success": True, "code": "SUCCESS", "message": "Success.", "data": {"questions": [question.to_dict() for question in questions], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK
