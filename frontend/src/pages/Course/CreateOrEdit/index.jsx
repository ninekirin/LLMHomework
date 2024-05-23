import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import { Space, Col, Row, Card, Input, Button, Form, message } from 'antd';

const CreateOrEditCourse = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const urlParams = new URL(window.location.href);
  const initialCourseId = urlParams?.searchParams?.get('id') || '';
  const [courseId, setCourseId] = useState(initialCourseId);
  const [course, setCourse] = useState({
    id: '',
    course_code: '',
    course_name: '',
    course_category: '',
  });

  const getCourse = id => {
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
          setCourse(response.data);
          form.setFieldsValue(response.data);
        } else {
          message.error(response.message);
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
          }
        }
      })
      .catch(error => {
        message.error('Error getting course.');
      });
  };

  const onFinish = values => {
    const data = courseId ? { ...values, course_id: courseId } : values;

    const method = courseId ? 'PUT' : 'POST';
    const endpoint = `${apiBaseUrl}/course`;

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          navigate('/course/list');
        } else {
          message.error(response.message);
          // NO_TOKEN, INVALID_TOKEN, EXPIRED_TOKEN: redirect to login
          if (
            response.code === 'NO_TOKEN' ||
            response.code === 'INVALID_TOKEN' ||
            response.code === 'EXPIRED_TOKEN'
          ) {
            navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
          }
        }
      })
      .catch(error => {
        message.error('Error saving course.');
      });
  };

  // Redirect to login if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    }
    if (initialCourseId) {
      getCourse(initialCourseId);
    }
  }, []);

  return (
    <Card title={courseId ? 'Edit Course' : 'Create Course'} headStyle={{ fontSize: '20px' }}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form
          form={form}
          name="create_or_edit_course"
          onFinish={onFinish}
          initialValues={course}
          layout="vertical"
        >
          {courseId && (
            <Col span={24}>
              <Form.Item name="id" label="Course ID" initialValue={courseId}>
                <Input placeholder="Course ID" disabled />
              </Form.Item>
            </Col>
          )}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="course_code"
                label="Course Code"
                rules={[{ required: true, message: 'Please input course code!' }]}
              >
                <Input placeholder="Course Code" disabled={!!courseId} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="course_name"
                label="Course Name"
                rules={[{ required: true, message: 'Please input course name!' }]}
              >
                <Input placeholder="Course Name" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="course_category"
                label="Course Category"
                rules={[{ required: true, message: 'Please input course category!' }]}
              >
                <Input placeholder="Course Category" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  Save Course
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Space>
    </Card>
  );
};

export default CreateOrEditCourse;
