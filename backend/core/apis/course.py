# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import Question, Course

from .user import jwt_token_required, admin_required

course_ns = Namespace(name="Course", description="Course related APIs")

"""
    Models
"""

add_course_model = course_ns.model('AddCourse', {
    'course_code': fields.String(required=True, description="Course code", example="COMP1023"),
    'course_name': fields.String(required=True, description="Course name", example="Foundation of C Programming"),
    'course_category': fields.String(required=True, description="Course category", example="MR")
})

delete_course_model = course_ns.model('DeleteCourse', {
    'id': fields.Integer(required=True, description="Course ID", example=1)
})

update_course_model = course_ns.model('UpdateCourse', {
    'id': fields.Integer(required=True, description="Course ID", example=1),
    'course_code': fields.String(required=True, description="Course code", example="COMP1023"),
    'course_name': fields.String(required=True, description="Course name", example="Foundation of C Programming"),
    'course_category': fields.String(required=True, description="Course category", example="PROG")
})


"""
    Flask-Restx routes
"""

@course_ns.route("")
class CourseApi(Resource):
    @course_ns.expect(add_course_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        course_code = data.get("course_code")
        course_name = data.get("course_name")
        course_category = data.get("course_category")

        if not course_code:
            return {"success": False, "code": "COURSE_CODE_MISSING", "message": "Course code is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_name:
            return {"success": False, "code": "COURSE_NAME_MISSING", "message": "Course name is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_category:
            return {"success": False, "code": "COURSE_CATEGORY_MISSING", "message": "Course category is required."}, HTTPStatus.BAD_REQUEST
        
        # check if any attribute already exists
        course = Course.get_course_by_code(course_code)
        if course:
            return {"success": False, "code": "COURSE_CODE_EXISTS", "message": "Course code already exists."}, HTTPStatus.BAD_REQUEST
        
        course = Course.get_course_by_name(course_name)
        if course:
            return {"success": False, "code": "COURSE_NAME_EXISTS", "message": "Course name already exists."}, HTTPStatus.BAD_REQUEST
        
        course = Course.add_course(course_code, course_name, course_category)
        
        if course:
            return {"success": True, "code": "COURSE_ADDED", "message": "Course added successfully.", "data": course.to_dict()}, HTTPStatus.CREATED
        else:
            return {"success": False, "code": "COURSE_ADD_FAILED", "message": "Failed to add course."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @course_ns.param("id", "Course ID")
    @course_ns.param("course_code", "Course code")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        id = data.get("id")
        course_code = data.get("course_code")

        if id and id.isdigit():
            course = Course.get_course_by_id(id)
            if course:
                return {"success": True, "code": "SUCCESS", "message": "Success.", "data": course.to_dict()}, HTTPStatus.OK
            else:
                return {"success": False, "code": "COURSE_NOT_FOUND", "message": "Course not found."}, HTTPStatus.NOT_FOUND
        elif id:
            return {"success": False, "code": "COURSE_ID_MISSING", "message": "Course ID is required."}, HTTPStatus.BAD_REQUEST
        
        if course_code:
            course = Course.get_course_by_code(course_code)
            if course:
                return {"success": True, "code": "SUCCESS", "message": "Success.", "data": course.to_dict()}, HTTPStatus.OK
            else:
                return {"success": False, "code": "COURSE_NOT_FOUND", "message": "Course not found."}, HTTPStatus.NOT_FOUND

    @course_ns.expect(update_course_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        course_code = data.get("course_code")
        course_name = data.get("course_name")
        course_category = data.get("course_category")

        if not id:
            return {"success": False, "code": "COURSE_ID_MISSING", "message": "Course ID is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_code:
            return {"success": False, "code": "COURSE_CODE_MISSING", "message": "Course code is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_name:
            return {"success": False, "code": "COURSE_NAME_MISSING", "message": "Course name is required."}, HTTPStatus.BAD_REQUEST
        
        if not course_category:
            return {"success": False, "code": "COURSE_CATEGORY_MISSING", "message": "Course category is required."}, HTTPStatus.BAD_REQUEST
        
        # check if course exists
        course = Course.get_course_by_id(id)
        if not course:
            return {"success": False, "code": "COURSE_NOT_FOUND", "message": "Course not found."}, HTTPStatus.NOT_FOUND
        
        # update course
        course = Course.update_course(id, course_code, course_name, course_category)

        if course:
            return {"success": True, "code": "COURSE_UPDATED", "message": "Course updated successfully.", "data": course}, HTTPStatus.OK
        else:
            return {"success": False, "code": "COURSE_UPDATE_FAILED", "message": "Failed to update course."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @course_ns.expect(delete_course_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")

        if not id:
            return {"success": False, "code": "COURSE_ID_MISSING", "message": "Course ID is required."}, HTTPStatus.BAD_REQUEST
        
        # check if course exists
        course = Course.get_course_by_id(id)
        if not course:
            return {"success": False, "code": "COURSE_NOT_FOUND", "message": "Course not found."}, HTTPStatus.NOT_FOUND
        
        # delete course
        deleted = Course.delete_course(id)

        if deleted:
            return {"success": True, "code": "COURSE_DELETED", "message": "Course deleted successfully."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "COURSE_DELETE_FAILED", "message": "Failed to delete course."}, HTTPStatus.INTERNAL_SERVER_ERROR

@course_ns.route("s")
class CoursesApi(Resource):
    @course_ns.param("ids", "List of course IDs")
    @course_ns.param("keyword", "Search keyword")
    @course_ns.param("current", description="Current page number", required=False, type="integer", default=1)
    @course_ns.param("pageSize", description="Page size", required=False, type="integer", default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    def get(self, cls):
        data = request.args

        ids = data.get("ids")
        # convert string to list
        if ids:
            ids = [int(id) for id in ids.split(",")]
            return {"success": True, "code": "SUCCESS", "message": "Success.", "data": {"courses": [course.to_dict() for course in Course.get_courses_by_ids(ids)]}}, HTTPStatus.OK
        
        keyword = data.get("keyword")
        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        if keyword:
            courses, total = Course.get_courses_by_name_or_code_paginated(keyword, current, pageSize)
        else:
            courses, total = Course.get_all_courses_paginated(current, pageSize)

        return {"success": True, "code": "SUCCESS", "message": "Success.", "data": {"courses": [course.to_dict() for course in courses], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK