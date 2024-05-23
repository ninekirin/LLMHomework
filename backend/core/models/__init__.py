# -*- encoding: utf-8 -*-

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .course import Course
from .help_topic import HelpTopic
from .jwt_token_blocklist import JWTTokenBlocklist
from .answer import Answer
from .experiment import Experiment
from .question import Question
from .request import Request
from .request_add_course import RequestAddCourse
from .request_add_experiment import RequestAddExperiment
from .request_update_score import RequestUpdateScore
from .user import User