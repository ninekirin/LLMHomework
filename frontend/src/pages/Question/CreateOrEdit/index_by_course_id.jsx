import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Col, Row, Card, Input, Button, Form, message } from 'antd';

const CreateQuestion = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const urlParams = new URL(window.location.href);
  const initialQuestionId = urlParams?.searchParams?.get('id') || '';
  const initialCourseId = urlParams?.searchParams?.get('course_id') || '';
  const [questionId, setQuestionId] = useState(initialQuestionId);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [courseName, setCourseName] = useState('');
  const [question, setQuestion] = useState({
    id: '',
    question_text: '',
    question_category: '',
    question_score: '',
    course_id: initialCourseId,
  });

  const getQuestion = id => {
    fetch(`${apiBaseUrl}/question?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setQuestion(response.data);
          form.setFieldsValue(response.data);
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
        message.error('Error getting question.');
      });
  };

  const getCourseName = id => {
    fetch(`${apiBaseUrl}/course?id=${id}`, {
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

  const onCourseIdChange = e => {
    const id = e.target.value;
    setCourseId(id);
    if (id) {
      getCourseName(id);
    } else {
      setCourseName('');
    }
  };

  const onFinish = values => {
    const method = questionId ? 'PUT' : 'POST';
    const endpoint = `${apiBaseUrl}/question`;

    fetch(endpoint, {
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
          message.success('Question saved successfully!');
          navigate('/question/list');
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
        message.error('Error saving question.');
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    }
    if (initialQuestionId) {
      getQuestion(initialQuestionId);
    }
    if (initialCourseId) {
      getCourseName(initialCourseId);
    }
  }, []);

  return (
    <Card
      title={questionId ? 'Edit Question' : 'Create Question'}
      style={{ width: '100%' }}
      headStyle={{ fontSize: '20px' }}
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form
          form={form}
          name="create_or_edit_question"
          onFinish={onFinish}
          initialValues={question}
          layout="vertical"
        >
          {questionId && (
            <Col span={24}>
              <Form.Item name="id" label="Question ID" initialValue={questionId}>
                <Input size="large" placeholder="Question ID" disabled />
              </Form.Item>
            </Col>
          )}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="question_text"
                label="Question Text"
                rules={[{ required: true, message: 'Please input question text!' }]}
              >
                <Input.TextArea
                  showCount
                  maxLength={65535}
                  style={{ height: '100px' }}
                  placeholder="What is the output of the following code?"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="question_category"
                label="Question Category"
                rules={[{ required: true, message: 'Please input question category!' }]}
              >
                <Input placeholder="PROG" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="question_score"
                label="Question Score"
                rules={[{ required: true, message: 'Please input question score!' }]}
              >
                <Input type="number" placeholder="100.0" />
              </Form.Item>
            </Col>
            {!questionId && (
              <Col span={12}>
                <Form.Item
                  name="course_id"
                  label="Course ID"
                  rules={[{ required: true, message: 'Please input course ID!' }]}
                >
                  <Input
                    type="number"
                    placeholder="1"
                    value={courseId}
                    onChange={onCourseIdChange}
                  />
                </Form.Item>
              </Col>
            )}
            {!questionId && courseName && (
              <Col span={12}>
                <Form.Item label="Course Name">
                  <Input value={courseName} disabled />
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  Save Question
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Space>
    </Card>
  );
};

export default CreateQuestion;
