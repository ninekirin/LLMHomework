import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/assets/js/config.js';
import {
  Space,
  Col,
  Row,
  Card,
  Input,
  Button,
  Form,
  message,
  Select,
  Checkbox,
  Divider,
} from 'antd';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Option } = Select;

const CreateExperimentWithLLM = () => {
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
  const initialQuestionId = urlParams?.searchParams?.get('question_id') || '';
  const [questionId, setQuestionId] = useState(initialQuestionId);
  const [question, setQuestion] = useState({
    id: '',
    question_text: '',
    question_score: '',
    course_code: '',
    course_name: '',
    course_category: '',
  });
  const [questionText, setQuestionText] = useState('');

  const [experimentText, setExperimentText] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [stream, setStream] = useState(false);
  const [loading, setLoading] = useState(false);

  const getQuestion = id => {
    if (!id) return;
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
          setQuestionText(response.data.question_text);
          form.setFieldsValue({ question_text: response.data.question_text });
        } else {
          message.error(response.message);
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
        message.error('Error getting question.');
      });
  };

  const onFinish = values => {
    const { question_id, experiment_text } = values;
    const data = {
      question_id,
      experiment_text,
    };

    fetch(`${apiBaseUrl}/experiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Personal experiment created successfully!');
          navigate('/experiment/list');
        } else {
          message.error(response.message);
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
        message.error('Error creating personal experiment.');
      });
  };

  const onChangeQuestionID = e => {
    const value = e.target.value;
    const regEx = /^[0-9]*$/;
    if (regEx.test(value)) {
      setQuestionId(value);
      if (value.length > 0) {
        clearTimeout(window.questionFetchTimeout);
        window.questionFetchTimeout = setTimeout(() => getQuestion(value), 300);
      }
    } else {
      message.error('Please input a valid question ID!');
    }
  };

  const generateLLMResponse = () => {
    // Check if question is fetched
    if (!question.id) {
      message.error('Please input a valid question ID!');
      return;
    }
    // Check if question text is entered
    if (!questionText) {
      message.error('Please input a question text!');
      return;
    }
    // Check if model is selected
    if (!model) {
      message.error('Please select a model!');
      return;
    }
    // clear experiment text
    setExperimentText('');
    form.setFieldsValue({ experiment_text: '' });
    setLoading(true);
    const data = {
      model,
      messages: [
        {
          role: 'user',
          content: `${questionText}`,
        },
      ],
      stream: stream,
    };
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(data),
    };
    const fetchUrl = `${apiBaseUrl}/llmapi/chat/completions`;
    fetch(fetchUrl, fetchOptions)
      .then(res => (stream ? res.body : res.json()))
      .then(response => {
        if (stream) {
          const reader = response.getReader();
          const decoder = new TextDecoder('utf-8');
          let experimentText = '';
          const readStream = ({ done, value }) => {
            if (done) {
              setLoading(false);
              return;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Extract JSON objects from the stream chunks
            const data = chunk.split('\n').filter(Boolean);
            data.forEach(item => {
              if (item === 'data: [DONE]') {
                setLoading(false);
                message.success('Experiment text generated successfully!');
              } else {
                try {
                  const json = JSON.parse(item.replace('data: ', ''));
                  if (json.choices[0].delta.content) {
                    experimentText += json.choices[0].delta.content;
                    setExperimentText(experimentText);
                    form.setFieldsValue({ experiment_text: experimentText });
                  }
                } catch (error) {
                  console.error('Error parsing stream chunk:', error);
                }
              }
            });
            reader.read().then(readStream);
          };
          reader.read().then(readStream);
        } else {
          if (response.choices[0].message.content) {
            setExperimentText(response.choices[0].message.content);
            form.setFieldsValue({ experiment_text: response.choices[0].message.content });
            message.success('Experiment text generated successfully!');
          } else {
            message.error('Error generating experiment text.');
          }
          setLoading(false);
        }
      })
      .catch(error => {
        message.error(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { navBackMsg: 'Login expired. Please login again.' } });
    }
    if (initialQuestionId) {
      getQuestion(initialQuestionId);
    }
  }, []);

  return (
    <Card title="Create Personal Experiment with LLM (Beta)" headStyle={{ fontSize: '20px' }}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form
          form={form}
          name="create_personal_experiment"
          onFinish={onFinish}
          initialValues={{ question_id: initialQuestionId }}
          layout="vertical"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="question_id"
                label="Question ID"
                rules={[{ required: true, message: 'Please input question ID!' }]}
              >
                <Input
                  onChange={onChangeQuestionID}
                  disabled={initialQuestionId}
                  placeholder="Question ID"
                  type="number"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              {questionText && (
                <Card title="Question Preview" bordered={false}>
                  <Markdown
                    remarkPlugins={[gfm]}
                    components={{
                      img(props) {
                        return <img {...props} style={{ maxWidth: '100%' }} />;
                      },
                      code: code,
                    }}
                  >
                    {questionText}
                  </Markdown>
                </Card>
              )}
            </Col>
            <Col span={24}>
              <Form.Item
                name="question_text"
                label="Question Text"
                rules={[{ required: true, message: 'Please input question text!' }]}
                onChange={e => setQuestionText(e.target.value)}
              >
                <Input.TextArea showCount maxLength={65535} style={{ height: '100px' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="model"
                label="API Model"
                rules={[{ required: true, message: 'Please select API model!' }]}
                initialValue="gpt-3.5-turbo"
              >
                <Select value={model} onChange={setModel}>
                  <Option value="gpt-3.5-turbo">gpt-3.5-turbo</Option>
                  <Option value="gpt-4-turbo">gpt-4-turbo</Option>
                  <Option value="gpt-4o">gpt-4o</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="stream" label="Stream Mode" valuePropName="checked">
                <Checkbox checked={stream} onChange={e => setStream(e.target.checked)} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" loading={loading} onClick={generateLLMResponse}>
                  Generate Experiment Text
                </Button>
              </Form.Item>
            </Col>
            <Col span={24}>
              {experimentText && (
                <>
                  <Card title="Experiment Text Preview" bordered={false}>
                    <Markdown
                      remarkPlugins={[gfm]}
                      components={{
                        img(props) {
                          return <img {...props} style={{ maxWidth: '100%' }} />;
                        },
                        code: code,
                      }}
                    >
                      {experimentText}
                    </Markdown>
                  </Card>
                  <Divider />
                </>
              )}
            </Col>
            <Col span={24}>
              <Form.Item
                name="experiment_text"
                label="Experiment Text"
                rules={[{ required: true, message: 'Please input experiment text!' }]}
                onChange={e => setExperimentText(e.target.value)}
              >
                <Input.TextArea showCount maxLength={65535} style={{ height: '100px' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  Save Personal Experiment
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Space>
    </Card>
  );
};

export default CreateExperimentWithLLM;
