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
  usertype: number; 
}

// 用户个人资料的类型 \
interface UserProfile {
  user_id: string; // 外部ID 
  username: string; // 登录名
  name: string; // 昵称
  usertype: string; // 用户类型
  avatar: string | null; // 用户头像URL
}

interface Confession {
  poster_name: string;
  create_at: string;
  update_at: string;
  id: number; // ID 是数字类型
  title: string;
  content: string;
  photos: string[];
  views: number;
  likes: number;
  liked: boolean;
}
interface ConfessionsResponseData {
  posts: Confession[];
  total: number;
  pages: number;
  current: number;
}


// 定义一个 Pinia 状态存储
export const useUserStore = defineStore('user', () => {
  const router = useRouter();


  const accessToken = ref(localStorage.getItem('access-token') || '');
  const refreshToken = ref(localStorage.getItem('refresh-token') || '');
  
  // 初始化为 null，表示应用启动时我们还没有获取到用户信息
  const profile = ref<UserProfile | null>(null);
  const isLoggedIn = computed(() => !!accessToken.value);

  // --- 帖子相关 (Confession) ---
  const myConfessions = ref<Confession[]>([]); 
  const isLoadingMyConfessions = ref(false);

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
    
      const { code, msg, data } = response.data;

      if (code == 200) { //200还是0

      setTokens(data['access-token'], data['refresh-token']);
      
      await fetchUserProfile();

      router.push('/profile'); 


      } else {
        throw new Error(msg || '登录失败');
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

  async function fetchMyConfessions() {

  if (!isLoggedIn.value) {
    console.warn('用户未登录，无法获取“我的帖子”。');
    return;
  }


  isLoadingMyConfessions.value = true;
  
  try {
    // 3. 发送 API 请求
    const response = await axios.get('/api/confessions/my', {
      headers: {
        // 【关键】这个接口需要认证，所以必须在请求头中带上 Bearer Token
        Authorization: `Bearer ${accessToken.value}`
      }
    });

    if (response.data.code == 200) { 
      const responseData: ConfessionsResponseData = response.data.data;
      myConfessions.value = responseData.posts || [];
    } else {
      // 如果业务码不为 200，则抛出一个业务错误
      throw new Error(response.data.msg || '获取帖子列表失败');
    }
  } catch (error: any) {
    // 5. 统一处理错误
    console.error("获取“我的帖子”失败:", error);
    // 将帖子列表清空，避免显示旧的或错误的数据
    myConfessions.value = [];

  } finally {

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

    isLoadingMyConfessions,
    fetchMyConfessions,
    myConfessions,
    
    notifications,
    unreadCount,
    isLoadingNotifications,
    hasNewMessages,

  };
})