  import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    import path from 'path' // 推荐加上 path 模块，用于路径解析

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [vue()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src') // 确保 @ 符号能正确解析到 src 目录
        }
      },
      server: {
        // 【核心检查区域】
        proxy: {
          // 规则的 key 必须是字符串，比如 '/api'
          '/api': {

            target: 'http://127.0.0.1:4523/m1/7120005-6842836-default',
            
            changeOrigin: true,

          }
        }
      }
    })