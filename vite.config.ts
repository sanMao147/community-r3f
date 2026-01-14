import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
  // 基础路径配置，用于 GitHub Pages 部署
  base: './',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // 构建优化
  build: {
    // 输出目录
    outDir: 'dist',
    // 生成源码映射，便于调试
    sourcemap: false,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 块大小警告限制（KB）
    chunkSizeWarningLimit: 1000,
    // Rollup 配置
    rollupOptions: {
      output: {
        // 手动分块策略
        manualChunks: {
          // React 相关库
          'react-vendor': ['react', 'react-dom'],
          // Three.js 相关库
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // 后处理效果
          'postprocessing': ['@react-three/postprocessing', 'postprocessing'],
          // 图表库
          'charts': ['echarts', 'echarts-for-react'],
          // 动画和状态管理
          'utils': ['gsap', 'zustand', 'leva'],
        },
        // 资源文件命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          let extType = info?.[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            extType = 'images'
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            extType = 'fonts'
          } else if (/\.(glb|gltf)$/i.test(assetInfo.name || '')) {
            extType = 'models'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // 压缩配置
    minify: 'esbuild',
    // esbuild 压缩配置
    
  },
  esbuild: {
      drop: ['console', 'debugger'],
    },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 热更新
    hmr: true,
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    open: true,
  },
  
  // 依赖优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand',
    ],
  },
})
