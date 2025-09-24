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
  user_id: string; // 外部ID 
  username: string; // 登录名
  name: string; // 昵称
  usertype: string; // 用户类型
  avatar: string | null; // 用户头像URL
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

// 【新增】定义一条表白帖子的类型
interface Confession {
  id: string;
  content: string;
  imageUrls: string[];
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  // ... 其他可能的字段，比如点赞数、评论数
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

  // 使用 Partial<T> 工具类型，表示这个对象里的所有属性都是可选的
type UserProfileUpdatePayload = Partial<{
  name: string;      // 昵称
  avatar: string; // 头像URL
  // ... 其他未来可能允许用户修改的字段
}>;

   // 用来存储从 API 获取到的、我发布的帖子列表
  const myConfessions = ref<Confession[]>([]);
  // 一个加载状态，方便 UI 显示“加载中...”
  const isLoadingMyConfessions = ref(false);

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

  // 更新用户个人资料的 Action
  async function updateProfile(payload: UserProfileUpdatePayload) {
    if (!isLoggedIn.value || !profile.value) return;

    try {
      // 1. 发送 PUT 请求到后端
      const response = await axios.put('/api/users/me', payload, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      });

      if (response.data.code === 0) {
        // 2. 更新成功后，用后端返回的最新用户信息来更新本地的 profile
        //    这确保了前端状态和后端数据库的最终一致性
        profile.value = response.data.data;
        
        // 也可以选择性地更新，如果后端只返回部分字段
        // Object.assign(profile.value, response.data.data);

      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error("更新用户信息失败:", error);
      // 将错误重新抛出，以便组件可以捕获并提示用户
      throw error;
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

  // 调用 API (GET /api/confessions/my) 来获取数据
  async function fetchMyConfessions() {
    if (!isLoggedIn.value) return; // 确保已登录

    isLoadingMyConfessions.value = true;
    try {
      const response = await axios.get('/api/confessions/my', {
        headers: {
          // 这个接口需要认证，所以必须带上 Token
          Authorization: `Bearer ${accessToken.value}`
        }
      });

      if (response.data.code === 0) {
        // 请求成功，将返回的帖子列表存入 state
        myConfessions.value = response.data.data.list; 
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error("获取我发布的帖子失败:", error);
      // 这里可以添加错误提示，比如弹出一个 Toast
    } finally {
      // 无论成功还是失败，最后都结束加载状态
      isLoadingMyConfessions.value = false;
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
    fetchUserProfile, // <-- 导出获取信息的方法
    updateProfile,
    notifications,
    unreadCount,
    isLoadingNotifications,
    hasNewMessages,
    fetchUnreadCount,
    fetchNotifications,
    markAllAsRead,
     myConfessions,
    isLoadingMyConfessions,
    fetchMyConfessions,
  };
})