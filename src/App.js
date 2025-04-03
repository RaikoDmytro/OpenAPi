import React from 'react'
import logo from './logo.svg';
import './App.css';
import SwaggerUi from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';

function App() {
  return (
      <SwaggerUi url="./swagger.json" />
  );
}

export default App;
