// React核心库
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // 全局样式

/**
 * 应用入口文件
 * 将React应用挂载到DOM节点
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
