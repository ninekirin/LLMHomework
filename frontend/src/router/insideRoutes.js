import React, { lazy } from 'react';
import {
  SecurityScanOutlined,
  HomeOutlined,
  SettingOutlined,
  ExperimentOutlined,
  UserOutlined,
  EditOutlined,
  BarsOutlined,
  TeamOutlined,
  FundViewOutlined,
  QuestionOutlined,
  SearchOutlined,
  PullRequestOutlined,
  EyeOutlined,
  ProfileOutlined,
  TagsOutlined,
} from '@ant-design/icons';

export const insideRoutes = [
  {
    path: 'home',
    title: 'Home',
    meta: { title: '', roles: [] },
    icon: <HomeOutlined />,
    component: lazy(() => import('@/pages/Home')),
  },
  {
    path: 'profile',
    title: 'Profile',
    meta: { title: '', roles: [] },
    icon: <UserOutlined />,
    items: [
      {
        path: '',
        redirect: 'user-information',
        hidden: true,
      },
      {
        path: 'user-information',
        title: 'User Information',
        meta: { title: '', roles: [] },
        icon: <ProfileOutlined />,
        component: lazy(() => import('@/pages/Profile/UserInformation')),
      },
      {
        path: 'change-password',
        title: 'Change Password',
        meta: { title: '', roles: [] },
        icon: <SecurityScanOutlined />,
        component: lazy(() => import('@/pages/Profile/ChangePassword')),
      },
    ],
  },
  {
    path: 'course',
    title: 'Course',
    meta: { title: '', roles: [] },
    icon: <FundViewOutlined />,
    hidden: localStorage.getItem('user')
      ? !['ADMIN', 'TEACHER'].includes(JSON.parse(localStorage.getItem('user')).user_type)
      : false,
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'List',
        meta: { title: '', roles: [] },
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Course/List')),
      },
      {
        path: 'create-or-edit',
        title: 'Create or Edit',
        meta: { title: '', roles: [] },
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Course/CreateOrEdit')),
        hidden: localStorage.getItem('user')
          ? !['ADMIN'].includes(JSON.parse(localStorage.getItem('user')).user_type)
          : false,
      },
    ],
  },
  {
    path: 'question',
    title: 'Question',
    meta: { title: '', roles: [] },
    icon: <QuestionOutlined />,
    hidden: localStorage.getItem('user')
      ? !['ADMIN', 'TEACHER'].includes(JSON.parse(localStorage.getItem('user')).user_type)
      : false,
    items: [
      {
        path: '',
        redirect: 'search',
        hidden: true,
      },
      {
        path: 'search',
        title: 'Search',
        meta: { title: '', roles: [] },
        icon: <SearchOutlined />,
        component: lazy(() => import('@/pages/Question/Search')),
      },
      {
        path: 'list',
        title: 'List',
        meta: { title: '', roles: [] },
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Question/List')),
      },
      {
        path: 'view',
        title: 'View',
        meta: { title: '', roles: [] },
        icon: <EyeOutlined />,
        component: lazy(() => import('@/pages/Question/View')),
      },
      {
        path: 'create-or-edit',
        title: 'Create or Edit',
        meta: { title: '', roles: [] },
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Question/CreateOrEdit')),
        hidden: localStorage.getItem('user')
          ? !['ADMIN'].includes(JSON.parse(localStorage.getItem('user')).user_type)
          : false,
      },
    ],
  },
  {
    path: 'experiment',
    title: 'Experiment',
    meta: { title: '', roles: [] },
    icon: <ExperimentOutlined />,
    hidden: localStorage.getItem('user')
      ? !['ADMIN', 'TEACHER'].includes(JSON.parse(localStorage.getItem('user')).user_type)
      : false,
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'My Experiments',
        meta: { title: '', roles: [] },
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Experiment/List')),
      },
      {
        path: 'view',
        title: 'View',
        meta: { title: '', roles: [] },
        icon: <EyeOutlined />,
        component: lazy(() => import('@/pages/Experiment/View')),
      },
      {
        path: 'create',
        title: 'Create',
        meta: { title: '', roles: [] },
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Experiment/Create')),
      },
      {
        path: 'create-with-llm',
        title: 'Create with LLM (Beta)',
        meta: { title: '', roles: [] },
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Experiment/CreateWithLLM')),
      },
    ],
  },
  {
    path: 'request',
    title: 'Request',
    meta: { title: '', roles: [] },
    icon: <PullRequestOutlined />,
    hidden: localStorage.getItem('user')
      ? !['ADMIN', 'TEACHER'].includes(JSON.parse(localStorage.getItem('user')).user_type)
      : false,
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'My Requests',
        meta: { title: '', roles: [] },
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Request/List')),
      },
      {
        path: 'create',
        title: 'Create',
        meta: { title: '', roles: [] },
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Request/Create')),
      },
    ],
  },
  {
    path: 'helptopic',
    title: 'Help Topic',
    meta: { title: '', roles: [] },
    icon: <TagsOutlined />,
    hidden: localStorage.getItem('user')
      ? !['ADMIN', 'TEACHER', 'STUDENT'].includes(
          JSON.parse(localStorage.getItem('user')).user_type
        )
      : false,
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'List',
        meta: { title: '', roles: [] },
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/HelpTopic/List')),
      },
      {
        path: 'view',
        title: 'View',
        meta: { title: '', roles: [] },
        icon: <EyeOutlined />,
        component: lazy(() => import('@/pages/HelpTopic/View')),
      },
      {
        path: 'create',
        title: 'Create',
        meta: { title: '', roles: [] },
        icon: <SearchOutlined />,
        component: lazy(() => import('@/pages/HelpTopic/Create')),
      },
      {
        path: 'create-with-llm',
        title: 'Create with LLM (Beta)',
        meta: { title: '', roles: [] },
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/HelpTopic/CreateWithLLM')),
      },
    ],
  },
  {
    path: 'management',
    title: 'Management',
    meta: { title: '', roles: [] },
    icon: <SettingOutlined />,
    hidden: localStorage.getItem('user')
      ? !['ADMIN'].includes(JSON.parse(localStorage.getItem('user')).user_type)
      : false,
    items: [
      {
        path: '',
        redirect: 'users',
        hidden: true,
      },
      {
        path: 'users',
        title: 'Users',
        meta: { title: '', roles: [] },
        icon: <TeamOutlined />,
        component: lazy(() => import('@/pages/Management/Users')),
      },
      {
        path: 'requests',
        title: 'Requests',
        meta: { title: '', roles: [] },
        icon: <PullRequestOutlined />,
        component: lazy(() => import('@/pages/Management/Requests')),
      },
    ],
  },
  {
    path: '*',
    title: '404',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/common/NotFound')),
    hidden: true,
  },
];
