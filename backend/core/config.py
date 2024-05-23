# -*- encoding: utf-8 -*-

import os
from datetime import timedelta


# if you want to create a new user in mysql, you can use the following sql query
"""
CREATE USER 'llmhomework'@'%' IDENTIFIED VIA mysql_native_password USING 'PASSWORD';
GRANT USAGE ON *.* TO 'llmhomework'@'%' REQUIRE NONE WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;
CREATE DATABASE IF NOT EXISTS `llmhomework`;
GRANT ALL PRIVILEGES ON `llmhomework`.* TO 'llmhomework'@'%';
"""


class BaseConfig():

    USE_SQLITE = True
    BASE_DIR = os.path.dirname(os.path.realpath(__file__))
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    if USE_SQLITE:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'llmhomework.db')
    else:
        HOSTNAME = os.getenv('MYSQLHOST', 'localhost')
        PORT = os.getenv('MYSQLPORT', '3306')
        DATABASE = os.getenv('MYSQLDATABASE', 'llmhomework')
        USERNAME = os.getenv('MYSQLUSER', 'llmhomework')
        PASSWORD = os.getenv('MYSQLPASSWORD', 'MYSQLPASSWORD')
        CHARSET = os.getenv('MYSQLCHARSET', 'utf8mb4')
        SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset={}'.format(
            USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE, CHARSET)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PAGE_SIZE = 10

    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'ADMIN_PASSWORD')
    SECRET_KEY = os.getenv('SECRET_KEY', 'SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    JWT_REGISTRATION_TOKEN_SECRET_KEY = os.getenv('JWT_REGISTRATION_TOKEN_SECRET_KEY', 'JWT_REGISTRATION_TOKEN_SECRET_KEY')
    JWT_REGISTRATION_TOKEN_EXPIRES = timedelta(hours=1)

    MAIL_SERVER=os.getenv('MAIL_SERVER', 'SMTPSERVERWITHTLS')
    MAIL_PORT=os.getenv('MAIL_PORT', 587)
    MAIL_USE_TLS=True
    MAIL_USE_SSL=False
    MAIL_USERNAME=os.getenv('MAIL_USERNAME', 'SAMPLE@EMAIL.COM')
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD', 'SAMPLEPASSWORD')

    LLM_API_ENDPOINT = os.getenv('LLM_API_ENDPOINT', 'https://api.openai.com/v1/chat/completions')
    LLM_API_KEY = os.getenv('LLM_API_KEY', 'SAMPLEAPIKEY')