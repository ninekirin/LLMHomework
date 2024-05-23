# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import HelpTopic, Course

from .user import admin_required, jwt_token_required

help_topic_ns = Namespace(name="HelpTopic", description="HelpTopic related APIs")

"""
    Models
"""

add_help_topic_model = help_topic_ns.model('AddHelpTopic', {
    'topic_title': fields.String(required=True, description="Help Topic title", example="Derivative of Polynomial"),
    'topic_content': fields.String(required=True, description="Help Topic content", example="Explanation about derivatives"),
    'topic_type': fields.String(required=True, description="Help Topic type", example="NORMAL"),
    'course_code': fields.Integer(required=True, description="Course ID", example="COMP3003"),
    'llm_name': fields.String(description="LLM used", example="ChatGPT-4"),
    'llm_answer': fields.String(description="LLM answer", example="The derivative of a polynomial.."),
    'human_score': fields.Float(description="Human score", example=4.5)
})

delete_help_topic_model = help_topic_ns.model('DeleteHelpTopic', {
    'id': fields.Integer(required=True, description="Help Topic ID", example=1)
})

# update_help_topic_model = help_topic_ns.model('UpdateHelpTopic', {
#     'id': fields.Integer(required=True, description="Help Topic ID", example=1),
#     'topic_title': fields.String(required=True, description="Help Topic title", example="Derivative of Polynomial"),
#     'topic_content': fields.String(required=True, description="Help Topic content", example="Explanation about derivatives"),
#     'topic_type': fields.String(required=True, description="Help Topic type", example="NORMAL"),
#     'llm_name': fields.String(description="LLM used", example="ChatGPT-4"),
#     'llm_answer': fields.String(description="LLM answer", example="The derivative of a polynomial.."),
#     'human_score': fields.Float(description="Human score", example=4.5)
# })

update_help_topic_content_model = help_topic_ns.model('UpdateHelpTopicContent', {
    'id': fields.Integer(required=True, description="Help Topic ID", example=1),
    'topic_content': fields.String(required=True, description="Help Topic content", example="Explanation about derivatives")
})

update_help_topic_content_by_id_model = help_topic_ns.model('UpdateHelpTopicByIdContent', {
    'topic_content': fields.String(required=True, description="Help Topic content", example="Explanation about derivatives")
})

"""
    Flask-Restx routes
"""

@help_topic_ns.route("")
class HelpTopicApi(Resource):
    @help_topic_ns.expect(add_help_topic_model)
    @jwt_token_required
    def post(self, cls):
        data = request.json

        topic_title = data.get("topic_title")
        topic_content = data.get("topic_content")
        topic_type = data.get("topic_type")
        course_code = data.get("course_code")
        llm_name = data.get("llm_name")
        llm_answer = data.get("llm_answer")
        human_score = data.get("human_score")
        if human_score:
            human_score = float(human_score)
        else:
            return {"success": False, "code": "HUMAN_SCORE_MISSING", "message": "Missing human score."}, HTTPStatus.BAD_REQUEST

        if not topic_title or not topic_content or not topic_type or not course_code:
            return {"success": False, "code": "HELP_TOPIC_CREATE_FAILED", "message": "Missing required fields."}, HTTPStatus.BAD_REQUEST

        course = Course.get_course_by_code(course_code)

        if not course:
            return {"success": False, "code": "COURSE_NOT_FOUND", "message": "Course not found."}, HTTPStatus.NOT_FOUND
        
        course_id = course.id
        
        if topic_type not in ["NORMAL", "QNA"]:
            return {"success": False, "code": "INVALID_TOPIC_TYPE", "message": "Invalid topic type, valid types are NORMAL, QNA."}, HTTPStatus.BAD_REQUEST

        new_topic = HelpTopic.add_topic(topic_title, topic_content, topic_type, course_id, llm_name, llm_answer, human_score)
        return {"success": True, "code": "SUCCESS", "message": "Help topic created successfully.", "data": new_topic.to_dict()}, HTTPStatus.CREATED
    
    @help_topic_ns.param("id", "Help topic ID")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        id = data.get("id")
        if not id:
            return {"success": False, "code": "HELP_TOPIC_ID_REQUIRED", "message": "Help topic ID is required."}, HTTPStatus.BAD_REQUEST

        topic = HelpTopic.get_topic_by_id(id)
        if topic:
            return {"success": True, "code": "SUCCESS", "message": "Success.", "data": topic.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "HELP_TOPIC_NOT_FOUND", "message": "Help topic not found."}, HTTPStatus.NOT_FOUND
    

    @help_topic_ns.expect(delete_help_topic_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")
        if not id:
            return {"success": False, "code": "HELP_TOPIC_DELETE_FAILED", "message": "Missing required fields."}, HTTPStatus.BAD_REQUEST

        success = HelpTopic.delete_topic(id)
        if success:
            return {"success": True, "code": "SUCCESS", "message": "Help topic deleted successfully."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "HELP_TOPIC_DELETE_FAILED", "message": "Failed to delete help topic."}, HTTPStatus.INTERNAL_SERVER_ERROR
        

    # @help_topic_ns.expect(update_help_topic_model)
    # @jwt_token_required
    # @admin_required
    # def put(self, cls):
    #     data = request.json

    #     id = data.get("id")
    #     topic_title = data.get("topic_title")
    #     topic_content = data.get("topic_content")
    #     topic_type = data.get("topic_type")
    #     llm_name = data.get("llm_name")
    #     llm_answer = data.get("llm_answer")
    #     human_score = data.get("human_score")

    #     if not id or not topic_title or not topic_content or not topic_type:
    #         return {"success": False, "code": "HELP_TOPIC_UPDATE_FAILED", "message": "Missing required fields."}, HTTPStatus.BAD_REQUEST

    #     success = HelpTopic.update_topic(id, topic_title, topic_content, topic_type, llm_name, llm_answer, human_score)
    #     if success:
    #         return {"success": True, "code": "SUCCESS", "message": "Help topic updated successfully."}, HTTPStatus.OK
    #     else:
    #         return {"success": False, "code": "HELP_TOPIC_UPDATE_FAILED", "message": "Failed to update help topic."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @help_topic_ns.expect(update_help_topic_content_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        topic_content = data.get("topic_content")

        if not id or not topic_content:
            return {"success": False, "code": "HELP_TOPIC_UPDATE_FAILED", "message": "Missing required fields."}, HTTPStatus.BAD_REQUEST

        topic = HelpTopic.get_topic_by_id(id)
        if topic:
            topic.topic_content = topic_content
            HelpTopic.save(topic)
            return {"success": True, "code": "SUCCESS", "message": "Help topic content updated successfully.", "data": topic.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "HELP_TOPIC_NOT_FOUND", "message": "Help topic not found."}, HTTPStatus.NOT_FOUND

@help_topic_ns.route("/<int:id>")
class HelpTopicByIdApi(Resource):
    @jwt_token_required
    def get(self, cls, id):
        topic = HelpTopic.get_topic_by_id(id)
        if topic:
            return {"success": True, "code": "SUCCESS", "message": "Success.", "data": topic}, HTTPStatus.OK
        else:
            return {"success": False, "code": "HELP_TOPIC_NOT_FOUND", "message": "Help topic not found."}, HTTPStatus.NOT_FOUND

    @help_topic_ns.expect(delete_help_topic_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls, id):
        success = HelpTopic.delete_topic(id)
        if success:
            return {"success": True, "code": "SUCCESS", "message": "Help topic deleted successfully."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "HELP_TOPIC_DELETE_FAILED", "message": "Failed to delete help topic."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @help_topic_ns.expect(update_help_topic_content_by_id_model)
    @jwt_token_required
    @admin_required
    def put(self, cls, id):
        data = request.json

        topic_content = data.get("topic_content")

        if not topic_content:
            return {"success": False, "code": "HELP_TOPIC_UPDATE_FAILED", "message": "Missing required fields."}, HTTPStatus.BAD_REQUEST

        topic = HelpTopic.get_topic_by_id(id)
        if topic:
            topic.topic_content = topic_content
            HelpTopic.save(topic)
            return {"success": True, "code": "SUCCESS", "message": "Help topic content updated successfully.", "data": topic.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "HELP_TOPIC_NOT_FOUND", "message": "Help topic not found."}, HTTPStatus.NOT_FOUND

@help_topic_ns.route("s")
class HelpTopicsApi(Resource):
    @help_topic_ns.param("keyword", "Search keyword")
    @help_topic_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @help_topic_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    def get(self, cls):
        data = request.args

        keyword = data.get("keyword")

        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        if keyword:
            topics, total = HelpTopic.get_topics_by_keyword_paginated(keyword, current, pageSize)
        else:
            topics, total = HelpTopic.get_all_topics_paginated(current, pageSize)

        return {"success": True, "code": "SUCCESS", "message": "Success.", "data": {"topics": [topic.to_dict() for topic in topics], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK
