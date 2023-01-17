import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // Ant Design Vue 的样式变量
          // 'primary-color': '#1DA57A', // #7546c9-紫色 1DA57A-青绿色
          'font-size-base': '15px'
        },
        // main.js => (import 'ant-design-vue/dist/antd.less')
        javascriptEnabled: true
      }
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // path in utils/route.js
      path: 'path-browserify'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '^/ws': {
        target: 'ws://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
