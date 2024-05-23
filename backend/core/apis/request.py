# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import Request, RequestAddCourse, RequestAddExperiment, RequestUpdateScore, Course, Experiment, Question, Answer

from .user import jwt_token_required, admin_required, teacher_required

request_ns = Namespace(name="Request", description="Request related APIs")


"""
    Models
"""

add_course_request_model = request_ns.model('AddCourseRequest', {
    'request_explanation': fields.String(description="Request explanation", example="Detailed explanation"),
    'course_code': fields.String(required=True, description="Course code", example="CS101"),
    'course_name': fields.String(required=True, description="Course name", example="Introduction to Computer Science"),
    'course_category': fields.String(required=True, description="Course category", example="CS"),
})

add_experiment_request_model = request_ns.model('AddExperimentRequest', {
    'request_explanation': fields.String(description="Request explanation", example="Detailed explanation"),
    'experiment_id': fields.Integer(required=True, description="Experiment ID", example=1),
    'llm_name': fields.String(required=True, description="LLM name", example="GPT-4"),
    'comment': fields.String(required=True, description="Comment", example="No comment"),
    'score': fields.Float(required=True, description="Score", example=4.5),
})

update_score_request_model = request_ns.model('UpdateScoreRequest', {
    'request_explanation': fields.String(description="Request explanation", example="Detailed explanation"),
    'answer_id': fields.Integer(required=True, description="Answer ID", example=1),
    'new_score': fields.Float(required=True, description="New score", example=4.5),
})

delete_request_model = request_ns.model('DeleteRequest', {
    'id': fields.Integer(required=True, description="Request ID", example=1)
})

update_request_model = request_ns.model('UpdateRequest', {
    'id': fields.Integer(required=True, description="Request ID", example=1),
    'request_status': fields.String(required=True, description="Request status", example="PENDING"),
})

"""
    Flask-Restx routes
"""

@request_ns.route("s")
class RequestsApi(Resource):
    @request_ns.param("request_type", description="Request type", required=False, type="string", default=None)
    @request_ns.param("request_status", description="Request status", required=False, type="string", default=None)
    @request_ns.param("desc_order", description="Order by ID desc", required=False, type="boolean", default="true")
    @request_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @request_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    @admin_required
    def get(self, cls):
        data = request.args

        request_type = data.get("request_type")
        request_status = data.get("request_status")
        desc_order = True if data.get("desc_order") == "true" else False

        current = int(data.get("current", 1))
        pageSize = int(data.get("pageSize", BaseConfig.PAGE_SIZE))

        if request_type and request_status:
            requests, total = Request.get_requests_by_type_and_status_paginated(request_type, request_status, current, pageSize, desc_order)
        elif request_type:
            requests, total = Request.get_requests_by_type_paginated(request_type, current, pageSize, desc_order)
        elif request_status:
            requests, total = Request.get_requests_by_status_paginated(request_status, current, pageSize, desc_order)
        else:
            requests, total = Request.get_requests_paginated(current, pageSize, desc_order)

        return {"success": True, "code": "SUCCESS", "message": "Requests found.", "data": {"requests": [request.to_dict() for request in requests], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK


@request_ns.route("s/myrequests")
class MyRequestsApi(Resource):
    @request_ns.param("request_type", description="Request type", required=False, type="string", default=None)
    @request_ns.param("request_status", description="Request status", required=False, type="string", default=None)
    @request_ns.param("desc_order", description="Order by ID desc", required=False, type="boolean", default="true")
    @request_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @request_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    @teacher_required
    def get(self, cls):
        data = request.args

        request_type = data.get("request_type")
        request_status = data.get("request_status")
        desc_order = True if data.get("desc_order") == "true" else False

        current = int(data.get("current", 1))
        pageSize = int(data.get("pageSize", BaseConfig.PAGE_SIZE))

        user_id = self.id

        if request_type and request_status:
            requests, total = Request.get_user_requests_by_type_and_status_paginated(user_id, request_type, request_status, current, pageSize, desc_order)
        elif request_type:
            requests, total = Request.get_user_requests_by_type_paginated(user_id, request_type, current, pageSize, desc_order)
        elif request_status:
            requests, total = Request.get_user_requests_by_status_paginated(user_id, request_status, current, pageSize, desc_order)
        else:
            requests, total = Request.get_user_requests_paginated(user_id, current, pageSize, desc_order)

        return {"success": True, "code": "SUCCESS", "message": "Requests found.", "data": {"requests": [request.to_dict() for request in requests], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK
    
@request_ns.route("/myrequest")
class MyRequestApi(Resource):
    @request_ns.expect(update_request_model)
    @jwt_token_required
    @teacher_required
    def put(self, cls):
        data = request.json

        id = data.get('id')
        request_status = data.get('request_status')

        if not id:
            return {"success": False, "code": "REQUEST_ID_MISSING", "message": "Request ID is required."}, HTTPStatus.BAD_REQUEST
        
        request_instance = Request.get_request_by_id(id)

        if request_instance:
            if request_instance.user_id != self.id:
                return {"success": False, "code": "NO_PERMISSION", "message": "You don't have permission to update this request."}, HTTPStatus.FORBIDDEN
            
             # compare request status with new status, if original status is not PENDING, return error
            if request_instance.request_status != 'PENDING':
                return {"success": False, "code": "REQUEST_NOT_PENDING", "message": "Request status is not PENDING."}, HTTPStatus.BAD_REQUEST
            
            # if new status is still PENDING, return error
            if request_status == 'PENDING':
                return {"success": False, "code": "REQUEST_ALREADY_PENDING", "message": "Request is already PENDING."}, HTTPStatus.BAD_REQUEST
            # teacher can not approve or reject request
            elif request_status == 'APPROVED' or request_status == 'REJECTED':
                return {"success": False, "code": "NO_PERMISSION", "message": "You don't have permission to approve or reject this request."}, HTTPStatus.FORBIDDEN
            elif request_status == 'REVOKED':
                Request.update_request_status(id, request_status)
                return {"success": True, "code": "REQUEST_REVOKED", "message": "Request revoked successfully."}, HTTPStatus.OK
            else:
                return {"success": False, "code": "INVALID_REQUEST_STATUS", "message": "Invalid request status."}, HTTPStatus.BAD_REQUEST
        else:
            return {"success": False, "code": "REQUEST_NOT_FOUND", "message": "Request not found."}, HTTPStatus.NOT_FOUND
        
    @request_ns.expect(delete_request_model)
    @jwt_token_required
    @teacher_required
    def delete(self, cls):
        data = request.json
        id = data.get('id')

        if not id:
            return {"success": False, "code": "REQUEST_ID_MISSING", "message": "Request ID is required."}, HTTPStatus.BAD_REQUEST
        
        request_instance = Request.get_request_by_id(id)

        if request_instance:
            if request_instance.user_id != self.id:
                return {"success": False, "code": "NO_PERMISSION", "message": "You don't have permission to delete this request."}, HTTPStatus.FORBIDDEN
            
            result = Request.delete_request(id)

            if result:
                return {"success": True, "code": "REQUEST_DELETED", "message": "Request deleted successfully."}, HTTPStatus.OK
            else:
                return {"success": False, "code": "REQUEST_NOT_FOUND", "message": "Request not found."}, HTTPStatus.NOT_FOUND
        else:
            return {"success": False, "code": "REQUEST_NOT_FOUND", "message": "Request not found."}, HTTPStatus.NOT_FOUND
                

@request_ns.route("")
class RequestApi(Resource):
    @jwt_token_required
    @teacher_required
    @request_ns.param("id", "Request ID")
    def get(self, cls):
        id = request.args.get("id")

        if id:
            request_instance = Request.get_request_by_id(id)
            if request_instance:
                if request_instance.user_id != self.id:
                    return {"success": False, "code": "NO_PERMISSION", "message": "You don't have permission to view this request."}, HTTPStatus.FORBIDDEN
                return {"success": True, "code": "SUCCESS", "message": "Request found.", "data": request_instance.to_dict()}, HTTPStatus.OK
            else:
                return {"success": False, "code": "REQUEST_NOT_FOUND", "message": "Request not found."}, HTTPStatus.NOT_FOUND
        else:
            return {"success": False, "code": "REQUEST_ID_MISSING", "message": "Request ID is required."}, HTTPStatus.BAD_REQUEST

    @request_ns.expect(delete_request_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json
        id = data.get('id')

        if not id:
            return {"success": False, "code": "REQUEST_ID_MISSING", "message": "Request ID is required."}, HTTPStatus.BAD_REQUEST
        
        result = Request.delete_request(id)

        if result:
            return {"success": True, "code": "REQUEST_DELETED", "message": "Request deleted successfully."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "REQUEST_NOT_FOUND", "message": "Request not found."}, HTTPStatus.NOT_FOUND

    @request_ns.expect(update_request_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get('id')
        request_status = data.get('request_status')

        if not id:
            return {"success": False, "code": "REQUEST_ID_MISSING", "message": "Request ID is required."}, HTTPStatus.BAD_REQUEST
        
        request_instance = Request.get_request_by_id(id)

        if request_instance:
            # compare request status with new status, if original status is not PENDING, return error
            if request_instance.request_status != 'PENDING':
                return {"success": False, "code": "REQUEST_NOT_PENDING", "message": "Request status is not PENDING."}, HTTPStatus.BAD_REQUEST
            
            # if new status is still PENDING, return error
            if request_status == 'PENDING':
                return {"success": False, "code": "REQUEST_ALREADY_PENDING", "message": "Request is already PENDING."}, HTTPStatus.BAD_REQUEST
            elif request_status == 'APPROVED':
                if request_instance.request_type == 'ADD_COURSE':
                    # check if course is already exist
                    course_instance = Course.get_course_by_code(request_instance.course_code)
                    if course_instance:
                        return {"success": False, "code": "COURSE_ALREADY_EXIST", "message": "Course already exist."}, HTTPStatus.BAD_REQUEST
                    
                    # add course
                    course_instance = Course.add_course(request_instance.course_code, request_instance.course_name, request_instance.course_category)
                    if course_instance:
                        Request.update_request_status(id, request_status)
                        return {"success": True, "code": "COURSE_ADDED", "message": "Course added successfully."}, HTTPStatus.OK
                    else:
                        return {"success": False, "code": "COURSE_NOT_ADDED", "message": "Course not added."}, HTTPStatus.INTERNAL_SERVER_ERROR
                elif request_instance.request_type == 'ADD_EXPERIMENT':
                    # check if experiment is already an answer
                    experiment_instance = Experiment.get_experiment_by_id(request_instance.experiment_id)
                    if not experiment_instance:
                        return {"success": False, "code": "EXPERIMENT_NOT_FOUND", "message": "Experiment not found."}, HTTPStatus.NOT_FOUND
                    
                    if experiment_instance.is_answer:
                        return {"success": False, "code": "EXPERIMENT_ALREADY_ANSWER", "message": "Experiment is already an answer."}, HTTPStatus.BAD_REQUEST
                    
                    # update experiment as answer
                    Experiment.update_experiment_is_answer(request_instance.experiment_id, True)

                    # add answer
                    answer_instance = Answer.add_answer(experiment_instance.question_id, request_instance.llm_name, experiment_instance.experiment_text, request_instance.comment, request_instance.score)
                    
                    if answer_instance:
                        Request.update_request_status(id, request_status)
                        return {"success": True, "code": "ANSWER_ADDED", "message": "Answer added successfully."}, HTTPStatus.OK
                    else:
                        return {"success": False, "code": "ANSWER_NOT_ADDED", "message": "Answer not added."}, HTTPStatus.INTERNAL_SERVER_ERROR
                    
                elif request_instance.request_type == 'UPDATE_SCORE':
                    # check if answer exists
                    answer_instance = Answer.get_answer_by_id(request_instance.answer_id)
                    if not answer_instance:
                        return {"success": False, "code": "ANSWER_NOT_FOUND", "message": "Answer not found."}, HTTPStatus.NOT_FOUND
                    
                    # check if new score is valid (between 0 and question max score)
                    question_id = Answer.get_question_id_by_answer_id(request_instance.answer_id)
                    question = Question.get_question_by_id(question_id)
                    question_score = question.question_score
                    if request_instance.new_score < 0 or request_instance.new_score > question_score:
                        return {"success": False, "code": "INVALID_SCORE", "message": "Invalid score. Score should be between 0 and question max score ({}).".format(question_score)}, HTTPStatus.BAD_REQUEST

                    # update answer score
                    Answer.update_score(request_instance.answer_id, request_instance.new_score)

                    Request.update_request_status(id, request_status)
                    return {"success": True, "code": "SCORE_UPDATED", "message": "Score updated successfully."}, HTTPStatus.OK
            elif request_status == 'REJECTED':
                Request.update_request_status(id, request_status)
                return {"success": True, "code": "REQUEST_REJECTED", "message": "Request rejected successfully."}, HTTPStatus.OK
            elif request_status == 'REVOKED':
                Request.update_request_status(id, request_status)
                return {"success": True, "code": "REQUEST_REVOKED", "message": "Request revoked successfully."}, HTTPStatus.OK
            else:
                return {"success": False, "code": "INVALID_REQUEST_STATUS", "message": "Invalid request status."}, HTTPStatus.BAD_REQUEST
        else:
            return {"success": False, "code": "REQUEST_NOT_FOUND", "message": "Request not found."}, HTTPStatus.NOT_FOUND
        

@request_ns.route("/addcourse")
class AddCourseRequestApi(Resource):
    @request_ns.expect(add_course_request_model)
    @jwt_token_required
    @teacher_required
    def post(self, cls):
        data = request.json

        user_id = self.id

        request_explanation = data.get("request_explanation")
        course_code = data.get("course_code")
        course_name = data.get("course_name")
        course_category = data.get("course_category")

        if not course_code:
            return {"success": False, "code": "COURSE_CODE_MISSING", "message": "Course code is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_name:
            return {"success": False, "code": "COURSE_NAME_MISSING", "message": "Course name is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_category:
            return {"success": False, "code": "COURSE_CATEGORY_MISSING", "message": "Course category is required."}, HTTPStatus.BAD_REQUEST
        
        # check if course is already exist
        course_instance = Course.get_course_by_code(course_code)
        if course_instance:
            return {"success": False, "code": "COURSE_ALREADY_EXIST", "message": "Course already exist."}, HTTPStatus.BAD_REQUEST

        # add course request
        request_instance = RequestAddCourse.add_course_request(user_id, 'PENDING', request_explanation, course_code, course_name, course_category)

        if request_instance:
            return {"success": True, "code": "REQUEST_ADDED", "message": "Request added successfully.", "id": request_instance.id}, HTTPStatus.OK
        else:
            return {"success": False, "code": "REQUEST_NOT_ADDED", "message": "Request not added."}, HTTPStatus.INTERNAL_SERVER_ERROR
        
@request_ns.route("/addexperiment")
class AddExperimentRequestApi(Resource):
    @request_ns.expect(add_experiment_request_model)
    @jwt_token_required
    @teacher_required
    def post(self, cls):
        data = request.json

        user_id = self.id
        
        request_explanation = data.get("request_explanation")
        experiment_id = data.get("experiment_id")
        llm_name = data.get("llm_name")
        comment = data.get("comment")
        score = data.get("score")
        if score:
            score = float(score)
        else:
            score = 0.0

        if not str(experiment_id):
            return {"success": False, "code": "EXPERIMENT_ID_MISSING", "message": "Experiment ID is required."}, HTTPStatus.BAD_REQUEST
        
        # check if experiment is already an answer
        experiment_instance = Experiment.get_experiment_by_id(experiment_id)
        if not experiment_instance:
            return {"success": False, "code": "EXPERIMENT_NOT_FOUND", "message": "Experiment not found."}, HTTPStatus.NOT_FOUND
        
        if experiment_instance.is_answer:
            return {"success": False, "code": "EXPERIMENT_ALREADY_ANSWER", "message": "Experiment is already an answer."}, HTTPStatus.BAD_REQUEST
           
        # check if experiment is already requested
        request_instance = RequestAddExperiment.get_request_by_experiment_id(experiment_id)
        if request_instance:
            return {"success": False, "code": "EXPERIMENT_ALREADY_REQUESTED", "message": "Experiment is already requested."}, HTTPStatus.BAD_REQUEST

        # check if new score is valid (between 0 and question max score)
        question_id = experiment_instance.question_id
        question = Question.get_question_by_id(question_id)
        question_score = question.question_score
        if score < 0 or score > question_score:
            return {"success": False, "code": "INVALID_SCORE", "message": "Invalid score. Score should be between 0 and question max score ({}).".format(question_score)}, HTTPStatus.BAD_REQUEST

        # add experiment request
        request_instance = RequestAddExperiment.add_experiment_request(user_id, 'PENDING', request_explanation, experiment_id, llm_name, comment, score)

        if request_instance:
            return {"success": True, "code": "REQUEST_ADDED", "message": "Request added successfully.", "id": request_instance.id}, HTTPStatus.OK
        else:
            return {"success": False, "code": "REQUEST_NOT_ADDED", "message": "Request not added."}, HTTPStatus.INTERNAL_SERVER_ERROR
        
@request_ns.route("/updatescore")
class UpdateScoreRequestApi(Resource):
    @request_ns.expect(update_score_request_model)
    @jwt_token_required
    @teacher_required
    def post(self, cls):
        data = request.json

        user_id = self.id

        request_explanation = data.get("request_explanation")
        answer_id = data.get("answer_id")
        new_score = data.get("new_score")
        if new_score:
            new_score = float(new_score)
        else:
            new_score = 0.0

        if not answer_id:
            return {"success": False, "code": "ANSWER_ID_MISSING", "message": "Answer ID is required."}, HTTPStatus.BAD_REQUEST
        
        if not new_score:
            return {"success": False, "code": "NEW_SCORE_MISSING", "message": "New score is required."}, HTTPStatus.BAD_REQUEST

        if new_score < 0:
            return {"success": False, "code": "INVALID_SCORE", "message": "Invalid score. Score should be greater than or equal to 0."}, HTTPStatus.BAD_REQUEST
        
        # check if answer exists
        answer_instance = Answer.get_answer_by_id(answer_id)
        if not answer_instance:
            return {"success": False, "code": "ANSWER_NOT_FOUND", "message": "Answer not found."}, HTTPStatus.NOT_FOUND
        
        # the user can only update the score once
        # query the request table to see if the user has submitted a score update request for this answer
        # and the status of the request is not REJECTED
        request_instance = RequestUpdateScore.get_request_by_answer_id(answer_id)
        if request_instance:
            if request_instance.user_id == user_id and request_instance.request_status != 'REJECTED':
                return {"success": False, "code": "REQUEST_ALREADY_SUBMITTED", "message": "You have already submitted a score update request for this answer. Every user can only submit one score update request for each answer."}, HTTPStatus.BAD_REQUEST

        # check if new score is valid (between 0 and question max score)
        question_id = Answer.get_question_id_by_answer_id(answer_id)
        question = Question.get_question_by_id(question_id)
        question_score = question.question_score
        if new_score < 0 or new_score > question_score:
            return {"success": False, "code": "INVALID_SCORE", "message": "Invalid score. Score should be between 0 and question max score ({}).".format(question_score)}, HTTPStatus.BAD_REQUEST
        
        # add score update request
        request_instance = RequestUpdateScore.add_score_update_request(user_id, 'PENDING', request_explanation, answer_id, new_score)

        if request_instance:
            return {"success": True, "code": "REQUEST_ADDED", "message": "Request added successfully.", "id": request_instance.id}, HTTPStatus.OK
        else:
            return {"success": False, "code": "REQUEST_NOT_ADDED", "message": "Request not added."}, HTTPStatus.INTERNAL_SERVER_ERROR
