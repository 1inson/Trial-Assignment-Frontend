import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // 导入 axios

// 定义注册和登录所需的数据类型，增强代码可读性
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterInfo {
  username: string;
  name: string; // 对应后端的 "name" 字段，即昵称
  password: string;
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter();

  const token = ref(localStorage.getItem('user-token') || '');
  const isLoggedIn = computed(() => !!token.value);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('user-token', newToken);
  }

  function clearToken() {
    token.value = '';
    localStorage.removeItem('user-token');
  }

  // 1. 实现真正的 login action
  async function login(credentials: LoginCredentials) {
    try {
      // 发送真实的POST请求到后端
      // 注意: /api/... 路径依赖于你在 vite.config.ts 中配置的代理
      const response = await axios.post('/api/users/login', credentials);

      // 检查后端返回的自定义 code 是否表示成功
      if (response.data.code === 0 && response.data.data.token) {
        // 如果成功，调用 setToken 保存凭证
        setToken(response.data.data.token);
      } else {
        // 如果后端返回业务错误（如密码错误），则抛出一个错误
        throw new Error(response.data.msg || '登录失败');
      }
    } catch (error) {
      console.error("API登录请求失败:", error);
      // 将错误重新抛出，以便 Vue 组件中的 catch 块可以捕获到它
      throw error;
    }
  }
  
  // 2. 实现真正的 register action
  async function register(info: RegisterInfo) {
    try {
      const response = await axios.post('/api/users/register', info);

      if (response.data.code !== 0) {
        // 如果注册失败（如用户名已存在），抛出错误
        throw new Error(response.data.msg || '注册失败');
      }
      // 注册成功，这里不需要做什么，因为组件会引导用户去登录
    } catch (error) {
      console.error("API注册请求失败:", error);
      throw error;
    }
  }

  function logout() {
    clearToken();
    router.push('/auth');
  }

  return { token, isLoggedIn, login, register, logout };
});