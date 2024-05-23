# -*- encoding: utf-8 -*-

from . import db
from .base import Base

# Enum for topic type, including 'NORMAL' and 'QNA' for question and answer type topics
help_topic_enum = db.Enum('NORMAL', 'QNA', name='help_topic_enum')

class HelpTopic(Base):
    __tablename__ = 'help_topic'

    topic_title = db.Column(db.Text(), nullable=False)  # Title of the help topic
    topic_content = db.Column(db.Text())  # Content of the help topic
    topic_type = db.Column(help_topic_enum, default='NORMAL')  # Type of the help topic
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))  # Foreign key to associate with a course
    llm_name = db.Column(db.String(50))  # Name of the LLM used to generate the answer
    llm_answer = db.Column(db.Text())  # LLM's answer to the topic help question
    human_score = db.Column(db.Float())  # Human-evaluated score on the helpfulness of the LLM's answer

    def __init__(self, topic_title, topic_content, topic_type, course_id, llm_name=None, llm_answer=None, human_score=None):
        super(HelpTopic, self).__init__()
        self.topic_title = topic_title
        self.topic_content = topic_content
        self.topic_type = topic_type
        self.course_id = course_id
        self.llm_name = llm_name
        self.llm_answer = llm_answer
        self.human_score = human_score

    def to_dict(self):
        return super().to_dict()

    @classmethod
    def get_topic_by_id(cls, topic_id):
        return cls.query.filter_by(id=topic_id).first()
    
    @classmethod
    def get_all_topics(cls):
        return cls.query.all()
    
    @classmethod
    def get_topics_by_course_id(cls, course_id):
        return cls.query.filter_by(course_id=course_id).all()
    
    @classmethod
    def get_all_topics_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def get_topics_by_course_id_paginated(cls, course_id, page, per_page):
        result = cls.query.filter_by(course_id=course_id).paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def get_topics_by_keyword_paginated(cls, keyword, page, per_page):
        result = cls.query.filter(cls.topic_title.ilike(f'%{keyword}%')).paginate(page=page, per_page=per_page)
        return result.items, result.total
    
    @classmethod
    def add_topic(cls, topic_title, topic_content, topic_type, course_id, llm_name=None, llm_answer=None, human_score=None):
        topic = HelpTopic(topic_title, topic_content, topic_type, course_id, llm_name, llm_answer, human_score)
        cls.save(topic)
        return topic

    @classmethod
    def delete_topic(cls, topic_id):
        topic = cls.query.filter_by(id=topic_id).first()
        if topic:
            cls.delete(topic)
            return True
        return False
    
    @classmethod
    def update_topic(cls, topic_id, topic_title, topic_content, topic_type, llm_name=None, llm_answer=None, human_score=None):
        topic = cls.query.filter_by(id=topic_id).first()
        if topic:
            topic.topic_title = topic_title
            topic.topic_content = topic_content
            topic.topic_type = topic_type
            topic.llm_name = llm_name
            topic.llm_answer = llm_answer
            topic.human_score = human_score
            cls.save(topic)
            return True
        return False
