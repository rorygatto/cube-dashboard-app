import './body.css';
//import 'antd/dist/antd.css';
import React from 'react';
import '@ant-design/compatible';
import { ApolloProvider } from '@apollo/react-hooks';
import { Layout } from 'antd';
import cubejs from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import client from './graphql/client';
import Header from './components/Header';

//const API_URL = 'http://localhost:4000';
// const API_URL = 'https://ivory-cardinal.aws-us-west-2.cubecloudapp.dev/'
const API_URL ='https://glorious-foosland.aws-us-west-2.cubecloudapp.dev';
//const CUBEJS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Njk2NjY0OTgsImV4cCI6MTY2OTc1Mjg5OH0.6pfQLRcbc9-fA1_xcryNMY4hFnshzdzyqXgGB-R5Okg';
// const CUBEJS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NzI2OTAzMzV9.64zMtOOjxuvLqzGt8r2v_eWvMKz3yV_5E5mynYqo5xM';
const CUBEJS_TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTQ1MjY0NjN9.l627Cy81cl-mS3S3cS3bX8511TjppIwD_i7e22EuyYc';
const cubejsApi = cubejs(CUBEJS_TOKEN, {
  apiUrl: `${API_URL}/cubejs-api/v1`,
});
const AppLayout = ({ children }) => (
  <Layout
    style={{
      height: '100%',
    }}
  >
    <Header />
    <Layout.Content>{children}</Layout.Content>
  </Layout>
);
const App = ({ children }) => (
  <CubeProvider cubejsApi={cubejsApi}>
    <ApolloProvider client={client}>
      <AppLayout>{children}</AppLayout>
    </ApolloProvider>
  </CubeProvider>
);
export default App;
