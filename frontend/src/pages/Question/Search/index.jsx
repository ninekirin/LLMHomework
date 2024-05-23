import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Space, Card, Form, Typography, Input } from 'antd';
import { FundViewOutlined, BarsOutlined, AreaChartOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const SearchForQuestions = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [searchType, setSearchType] = useState('course_name_or_code'); // Types: course, category, score, text
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const gridStyle = type => ({
    width: isMobile ? '100%' : '33.33%',
    textAlign: 'center',
    backgroundColor: searchType === type ? '#f0f0f0' : 'white', // Conditional background color
    color: searchType === type ? 'black' : '#1890ff', // Conditional text color
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

  const handleSearch = value => {
    const params = { current: 1, pageSize: 10 };
    if (searchType === 'course_name_or_code' && value) {
      params.course_name_or_code = value;
    } else if (searchType === 'course_category' && value) {
      params.course_category = value;
    } else if (searchType === 'question_score' && value) {
      params.score = value;
    } else if (searchType === 'text' && value) {
      params.keyword = value;
    }
    navigate(`/question/list?${new URLSearchParams(params).toString()}`);
  };

  const SearchBox = ({ placeholder }) => (
    <Form style={{ width: '100%' }}>
      <Form.Item name="search">
        <Search
          placeholder={placeholder}
          allowClear
          enterButton="Search"
          size="large"
          onSearch={handleSearch}
        />
      </Form.Item>
    </Form>
  );

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Search for Questions" headStyle={{ fontSize: '20px' }}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Title level={4} style={{ textAlign: 'center' }}>
            Select Search Type
          </Title>
          <Card>
            <Card.Grid
              style={gridStyle('course_name_or_code')}
              onClick={() => setSearchType('course_name_or_code')}
            >
              <Space>
                <FundViewOutlined />
                Search by course name or code
              </Space>
            </Card.Grid>
            <Card.Grid
              style={gridStyle('course_category')}
              onClick={() => setSearchType('course_category')}
            >
              <Space>
                <BarsOutlined />
                Search by course category
              </Space>
            </Card.Grid>
            <Card.Grid
              style={gridStyle('question_score')}
              onClick={() => setSearchType('question_score')}
            >
              <Space>
                <AreaChartOutlined />
                Search by question score
              </Space>
            </Card.Grid>
          </Card>
          <Title level={4} style={{ textAlign: 'center' }}>
            Search by{' '}
            {searchType === 'course_name_or_code'
              ? 'Course Name or Course Code'
              : searchType === 'course_category'
              ? 'Course Category'
              : searchType === 'question_score'
              ? 'Question Score'
              : 'Question Text'}
          </Title>
          {searchType === 'course_name_or_code' && (
            <SearchBox placeholder="Enter the course name or course code" />
          )}
          {searchType === 'course_category' && (
            <SearchBox placeholder="Enter the course category" />
          )}
          {searchType === 'question_score' && <SearchBox placeholder="Enter the question score" />}
          {searchType === 'text' && <SearchBox placeholder="Search by question text" />}
        </Space>
      </Card>
    </Space>
  );
};

export default SearchForQuestions;
