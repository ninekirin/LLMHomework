import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Form, Space, message } from 'antd';
import { FundViewOutlined, EditOutlined, ExperimentOutlined } from '@ant-design/icons';
import { apiBaseUrl } from '@/assets/js/config';

const MakeRequest = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const urlParams = new URL(window.location.href);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [requestType, setRequestType] = useState(
    urlParams?.searchParams?.get('experiment_id')
      ? 'ADD_EXPERIMENT'
      : urlParams?.searchParams?.get('answer_id')
      ? 'UPDATE_SCORE'
      : 'ADD_COURSE'
  );
  const [experiment_id, setExperimentId] = useState(urlParams?.searchParams?.get('experiment_id'));
  const [answer_id, setAnswerId] = useState(urlParams?.searchParams?.get('answer_id'));

  const gridStyle = type => ({
    width: isMobile ? '100%' : '33.33%',
    textAlign: 'center',
    backgroundColor: requestType === type ? '#f0f0f0' : 'white',
    color: requestType === type ? 'black' : '#1890ff',
    cursor: 'pointer',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    }
  }, [navigate]);

  const handleSubmit = values => {
    let url = '';
    let body = {};

    switch (requestType) {
      case 'ADD_COURSE':
        url = `${apiBaseUrl}/request/addcourse`;
        body = {
          course_code: values.course_code,
          course_name: values.course_name,
          course_category: values.course_category,
          request_explanation: values.request_explanation,
        };
        break;
      case 'UPDATE_SCORE':
        url = `${apiBaseUrl}/request/updatescore`;
        body = {
          answer_id: values.answer_id,
          new_score: values.new_score,
          request_explanation: values.request_explanation,
        };
        break;
      case 'ADD_EXPERIMENT':
        url = `${apiBaseUrl}/request/addexperiment`;
        body = {
          request_explanation: values.request_explanation,
          experiment_id: values.experiment_id,
          llm_name: values.llm_name,
          comment: values.comment,
          score: values.score,
        };
        break;
      default:
        return;
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          form.resetFields();
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
      .catch(() => {
        message.error('Error processing request.');
      });
  };

  const renderRequestForm = () => {
    switch (requestType) {
      case 'ADD_COURSE':
        return (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="course_code"
              label="Course Code"
              rules={[{ required: true, message: 'Please enter the course code!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="course_name"
              label="Course Name"
              rules={[{ required: true, message: 'Please enter the course name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="course_category"
              label="Course Category"
              rules={[{ required: true, message: 'Please enter the course category!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="request_explanation" label="Explanation">
              <Input.TextArea />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Request to Add Course
              </Button>
            </Form.Item>
          </Form>
        );
      case 'UPDATE_SCORE':
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ answer_id: answer_id }}
          >
            <Form.Item
              name="answer_id"
              label="Answer ID"
              rules={[{ required: true, message: 'Please enter the answer ID!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="new_score"
              label="New Score"
              rules={[{ required: true, message: 'Please enter the new score!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item name="request_explanation" label="Explanation">
              <Input.TextArea />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Request to Update Score
              </Button>
            </Form.Item>
          </Form>
        );
      case 'ADD_EXPERIMENT':
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ experiment_id: experiment_id }}
          >
            <Form.Item
              name="experiment_id"
              label="Experiment ID"
              rules={[{ required: true, message: 'Please enter the experiment ID!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item name="llm_name" label="LLM Name">
              <Input />
            </Form.Item>
            <Form.Item name="comment" label="Comment">
              <Input />
            </Form.Item>
            <Form.Item name="score" label="Score">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="request_explanation" label="Explanation">
              <Input.TextArea />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Request to Add Experiment
              </Button>
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <Card title="Make Request" headStyle={{ fontSize: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Select Request Type" headStyle={{ fontSize: '20px', textAlign: 'center' }}>
          <Card.Grid style={gridStyle('ADD_COURSE')} onClick={() => setRequestType('ADD_COURSE')}>
            <Space>
              <FundViewOutlined />
              Add Course
            </Space>
          </Card.Grid>
          <Card.Grid
            style={gridStyle('UPDATE_SCORE')}
            onClick={() => setRequestType('UPDATE_SCORE')}
          >
            <Space>
              <EditOutlined />
              Update Score
            </Space>
          </Card.Grid>
          <Card.Grid
            style={gridStyle('ADD_EXPERIMENT')}
            onClick={() => setRequestType('ADD_EXPERIMENT')}
          >
            <Space>
              <ExperimentOutlined />
              Add Experiment
            </Space>
          </Card.Grid>
        </Card>
        <Card style={{ marginTop: 20 }}>{renderRequestForm()}</Card>
      </Space>
    </Card>
  );
};

export default MakeRequest;
