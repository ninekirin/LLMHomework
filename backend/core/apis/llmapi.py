# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request, jsonify, Response, stream_with_context
from flask_restx import Namespace, Resource, fields
from functools import wraps
import requests

from core.config import BaseConfig

from .user import jwt_token_required, admin_required, teacher_required

llmapi = Namespace(name="LLM API", description="A Proxy API for the LLM API")

"""
    Models
"""

# Define the request model for the LLM API
llm_request_model = llmapi.model('LLMRequest', {
    'model': fields.String(required=True, description="Model to use", example="gpt-3.5-turbo"),
    'messages': fields.List(fields.Nested(llmapi.model('Message', {
        'role': fields.String(required=True, description="Role of the message", example="user"),
        'content': fields.String(required=True, description="Content of the message", example="who are you?")
    }))),
    'stream': fields.Boolean(required=True, description="Stream the response", example=False),
    'presence_penalty': fields.Float(required=False, description="Presence penalty", example=0.0),
    'frequency_penalty': fields.Float(required=False, description="Frequency penalty", example=0.0),
    'temperature': fields.Float(required=False, description="Temperature", example=0.7),
    'max_tokens': fields.Integer(required=False, description="Maximum tokens", example=2048)
})

"""
    Flask-Restx routes
"""

@llmapi.route("/chat/completions")
class LLMAPIProxy(Resource):
    @llmapi.expect(llm_request_model)
    @jwt_token_required
    def post(self, cls):
        data = request.json
        
        headers = {
            'authorization': 'Bearer ' + BaseConfig.LLM_API_KEY,
            'content-type': 'application/json'
        }

        stream = data.get('stream', False)
        
        response = requests.post(BaseConfig.LLM_API_ENDPOINT, headers=headers, json=data, stream=stream)

        if stream:
            def generate():
                for chunk in response.iter_content(chunk_size=1024):
                    yield chunk

            return Response(stream_with_context(generate()), content_type=response.headers['content-type'])
        else:
            return jsonify(response.json())
        
# @llmapi.route("/chat/completions/stream")
# class LLMAPIProxyStream(Resource):
#     @llmapi.expect(llm_request_model)
#     @jwt_token_required
#     def post(self, cls):
#         data = request.json
        
#         headers = {
#             'authorization': 'Bearer ' + BaseConfig.LLM_API_KEY,
#             'content-type': 'application/json'
#         }

#         response = requests.post(BaseConfig.LLM_API_ENDPOINT, headers=headers, json=data, stream=True)

#         def generate():
#             for chunk in response.iter_content(chunk_size=1024):
#                 yield chunk

#         return Response(stream_with_context(generate()), content_type=response.headers['content-type'])