# -*- encoding: utf-8 -*-

from flask_restx import Api

from .user import user_ns
from .course import course_ns
from .question import question_ns
from .experiment import experiment_ns
from .answer import answer_ns
from .request import request_ns
from .help_topic import help_topic_ns
from .llmapi import llmapi

authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'Header',
        'name': 'Authorization',
        'description': 'Bearer token for authentication (JWT token required)'
    }
}

rest_api = Api(version="1.0", title="LLM Homework API", prefix="/api/v1",
               description="LLM Homework API", security="Bearer Auth",
               authorizations=authorizations)

rest_api.add_namespace(user_ns, path="/user")
rest_api.add_namespace(course_ns, path="/course")
rest_api.add_namespace(question_ns, path="/question")
rest_api.add_namespace(experiment_ns, path="/experiment")
rest_api.add_namespace(answer_ns, path="/answer")
rest_api.add_namespace(request_ns, path="/request")
rest_api.add_namespace(help_topic_ns, path="/helptopic")
rest_api.add_namespace(llmapi, path="/llmapi")