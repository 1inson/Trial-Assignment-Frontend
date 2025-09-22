import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';


interface LoginCredentials {
  username: string;
  password: string;
}

// 注册信息的类型
interface RegisterInfo {
  username: string;
  name: string; // 对应后端的 "name" 字段，即昵称
  password: string;
}

// 用户个人资料的类型 \
interface UserProfile {
  id: string; // 外部ID 
  username: string; // 登录名
  name: string; // 昵称
  usertype: number; // 用户类型
  avatarUrl: string | null; // 用户头像URL
}

// 【新增】定义一条通知的类型
interface Notification {
  id: string;
  type: 'comment' | 'reply' | 'like';
  actor: { // 操作者
    id: string;
    name: string;
  };
  relatedContent: { // 关联内容
    type: 'confession' | 'comment';
    id: string;
    textSnippet: string; // 内容片段
  };
  createdAt: string; // 时间戳
  isRead: boolean;
}

// 定义一个 Pinia 状态存储
export const useUserStore = defineStore('user', () => {
  const router = useRouter();


  const accessToken = ref(localStorage.getItem('access-token') || '');
  const refreshToken = ref(localStorage.getItem('refresh-token') || '');
  
  // 初始化为 null，表示应用启动时我们还没有获取到用户信息
  const profile = ref<UserProfile | null>(null);
  const isLoggedIn = computed(() => !!accessToken.value);

  const notifications = ref<Notification[]>([]);
  const unreadCount = ref<number>(0);
  const isLoadingNotifications = ref(false);
  const hasNewMessages = computed(() => unreadCount.value > 0);

  function setTokens(newAccessToken: string, newRefreshToken: string) {
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem('access-token', newAccessToken);
    localStorage.setItem('refresh-token', newRefreshToken);
  }

  function clearTokens() {
    accessToken.value = '';
    refreshToken.value = '';
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
  }

  async function login(credentials: LoginCredentials) {
    try {
      const response = await axios.post('/api/users/login', credentials);
      const data = response.data.data;

      if (response.data.code == 200 && data && data['access-token']) {
        setTokens(data['access-token'], data['refresh-token']);
        

        await fetchUserProfile();

      } else {
        throw new Error(response.data.msg || '登录失败');
      }
    } catch (error) {
      console.error("API登录请求失败:", error);
      throw error;
    }
  }

  async function register(info: RegisterInfo) {
    try {
       const response = await axios.post('/api/users/register', info);
       if (response.data.code != 200) {
         throw new Error(response.data.msg || '注册失败');
       }
       // 注册成功通常不直接登录，让用户手动登录一次，所以这里不做setTokens
    } catch (error) {
      console.error("API注册请求失败:", error);
      throw error;
    }
  }

  function logout() {
    clearTokens();
    profile.value = null; // 【新增】退出登录时，清空用户信息
    router.push('/auth');
  }

  // --- 用户资料相关 (User Profile) ---

  async function fetchUserProfile() {
    // 如果没有登录，或者已经有用户信息了，就不需要重复获取
    if (!isLoggedIn.value || profile.value) {
      return;
    }

    try {
      const response = await axios.get('/api/users/me', {
        headers: {
          // 【关键】所有需要认证的请求，都必须在请求头带上 Bearer Token
          Authorization: `Bearer ${accessToken.value}`
        }
      });

      if (response.data.code == 200) {
        profile.value = response.data.data;
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 获取失败通常意味着 token 失效或过期，此时应该强制用户退出
      logout(); 
    }
  }


  // 获取未读消息数 (用于更新小红点)
  async function fetchUnreadCount() {
    if (!isLoggedIn.value) return;
    try {
      const response = await axios.get('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      });
      if (response.data.code === 0) {
        unreadCount.value = response.data.data.count;
      }
    } catch (error) {
      console.error('获取未读消息数失败:', error);
    }
  }

  // 获取完整的消息列表 (用于“我的消息”页面)
  async function fetchNotifications() {
    if (!isLoggedIn.value) return;
    isLoadingNotifications.value = true;
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      });
      if (response.data.code === 0) {
        notifications.value = response.data.data.list;
        // 获取完列表后，顺便更新未读数
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('获取消息列表失败:', error);
    } finally {
      isLoadingNotifications.value = false;
    }
  }

  // 标记所有消息为已读
  async function markAllAsRead() {
    if (!isLoggedIn.value || unreadCount.value === 0) return;
    try {
      const response = await axios.post('/api/notifications/mark-as-read', {}, {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      });
      if (response.data.code === 0) {
        // 后端成功后，前端立即将未读数清零，UI实时响应
        unreadCount.value = 0;
        // 也可以选择性地更新本地列表的 isRead 状态
        notifications.value.forEach(n => n.isRead = true);
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }


  return { 
    accessToken, 
    refreshToken, 
    profile, // <-- 导出用户信息
    isLoggedIn, 
    login, 
    register, 
    logout,
    fetchUserProfile // <-- 导出获取信息的方法
    notifications,
    unreadCount,
    isLoadingNotifications,
    hasNewMessages,
    fetchUnreadCount,
    fetchNotifications,
    markAllAsRead
  };
})