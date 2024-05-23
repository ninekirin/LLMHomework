import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Card, Input, Button, Form, message } from 'antd';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CreateHelpTopic = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const code = ({ node, inline, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={coldarkCold} language={match[1]} PreTag="div" {...props}>
        {props.children}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {props.children}
      </code>
    );
  };

  const urlParams = new URL(window.location.href);
  const initialTopicId = urlParams?.searchParams?.get('id') || '';
  const initialCourseCode = urlParams?.searchParams?.get('course_code') || '';
  const [topicId, setTopicId] = useState(initialTopicId);
  const [courseCode, setCourseCode] = useState(initialCourseCode);
  const [courseName, setCourseName] = useState('');
  const [helpTopic, setHelpTopic] = useState({
    topic_title: '',
    topic_content: '',
    topic_type: '',
    course_id: '',
    llm_name: '',
    llm_answer: '',
    human_score: '',
  });
  const [topicContent, setTopicContent] = useState('');
  const [llmAnswer, setLlmAnswer] = useState('');

  const getHelpTopic = id => {
    fetch(`${apiBaseUrl}/helptopic/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setHelpTopic(response.data);
          setTopicContent(response.data.topic_content);
          setLlmAnswer(response.data.llm_answer);
          form.setFieldsValue(response.data);
        } else {
          message.error(response.message);
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', {
              state: { navBackMsg: 'Login expired. Please login again.' },
            });
          }
        }
      })
      .catch(error => {
        message.error('Error getting help topic.');
      });
  };

  const getCourseName = course_code => {
    fetch(`${apiBaseUrl}/course?course_code=${course_code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setCourseName(response.data.course_name);
        } else {
          message.error(response.message);
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', {
              state: { navBackMsg: 'Login expired. Please login again.' },
            });
          }
        }
      })
      .catch(error => {
        message.error('Error getting course.');
      });
  };

  useEffect(() => {
    if (topicId) {
      getHelpTopic(topicId);
    }
    if (initialCourseCode) {
      getCourseName(initialCourseCode);
    }
  }, [topicId, initialCourseCode]);

  const onCourseCodeChange = e => {
    const course_code = e.target.value;
    setCourseCode(course_code);
    if (course_code.length > 0) {
      // Fetch the question after a delay if input is valid
      clearTimeout(window.questionFetchTimeout);
      window.questionFetchTimeout = setTimeout(() => getCourseName(course_code), 500);
    } else {
      setCourseName('');
    }
  };

  const onFinish = values => {
    const method = topicId ? 'PUT' : 'POST';

    fetch(`${apiBaseUrl}/helptopic`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(values),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Help topic saved successfully!');
          navigate('/helptopic/list');
        } else {
          message.error(response.message);
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', {
              state: { navBackMsg: 'Login expired. Please login again.' },
            });
          }
        }
      })
      .catch(error => {
        message.error('Error saving help topic.');
      });
  };

  return (
    <Card title="Create Help Topic" headStyle={{ fontSize: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={helpTopic}>
          <Form.Item
            name="topic_title"
            label="Topic Title"
            rules={[{ required: true, message: 'Please input topic title!' }]}
          >
            <Input placeholder="Derivative of Polynomial" />
          </Form.Item>

          <Form.Item
            name="topic_type"
            label="Topic Type"
            rules={[{ required: true, message: 'Please input topic type!' }]}
          >
            <Input placeholder="NORMAL" />
          </Form.Item>

          <Form.Item
            name="course_code"
            label="Course Code"
            rules={[{ required: true, message: 'Please input course Code!' }]}
          >
            <Input placeholder="COMP3003" value={courseCode} onChange={onCourseCodeChange} />
          </Form.Item>

          {courseName && (
            <Form.Item label="Course Name">
              <Input value={courseName} disabled />
            </Form.Item>
          )}

          <Form.Item
            name="llm_name"
            label="LLM Name"
            rules={[{ required: false, message: 'Please input LLM name!' }]}
          >
            <Input placeholder="ChatGPT-4" />
          </Form.Item>

          <Form.Item
            name="human_score"
            label="Human Score"
            rules={[{ required: false, message: 'Please input human score!' }]}
          >
            <Input type="number" placeholder="4.5" />
          </Form.Item>

          <Form.Item
            name="topic_content"
            label="Topic Content"
            rules={[{ required: true, message: 'Please input topic content!' }]}
          >
            <Input.TextArea
              placeholder="Explanation about derivatives."
              style={{ height: '100px' }}
              value={topicContent}
              onChange={e => setTopicContent(e.target.value)}
            />
          </Form.Item>

          <Card title="Preview Topic Content" bordered={false}>
            <Markdown
              remarkPlugins={[gfm]}
              components={{
                img(props) {
                  return <img {...props} style={{ maxWidth: '100%' }} />;
                },
                code: code,
              }}
            >
              {topicContent}
            </Markdown>
          </Card>

          <Form.Item
            name="llm_answer"
            label="LLM Answer"
            rules={[{ required: false, message: 'Please input LLM answer!' }]}
          >
            <Input.TextArea
              placeholder="The derivative of a polynomial..."
              style={{ height: '100px' }}
              value={llmAnswer}
              onChange={e => setLlmAnswer(e.target.value)}
            />
          </Form.Item>

          <Card title="Preview LLM Answer" bordered={false}>
            <Markdown
              remarkPlugins={[gfm]}
              components={{
                img(props) {
                  return <img {...props} style={{ maxWidth: '100%' }} />;
                },
                code: code,
              }}
            >
              {llmAnswer}
            </Markdown>
          </Card>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              Save Help Topic
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};

export default CreateHelpTopic;
