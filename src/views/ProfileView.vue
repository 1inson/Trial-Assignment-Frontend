<template>
  <!-- 添加一个全局导航栏，方便用户在页面间跳转 -->
  <AppHeader />

  <div class="profile-page" v-if="userStore.profile">
    <!-- 1. 顶部信息展示区 -->
    <header class="profile-header">
      <div class="avatar-container">
        <img :src="userStore.profile.avatar || defaultAvatar" alt="用户头像" class="avatar">
        <button class="edit-avatar-button" @click="openAvatarModal">更换头像</button>
      </div>
      <div class="user-info">
        <h1 class="nickname">{{ userStore.profile.name }}</h1>
        <p class="username">@{{ userStore.profile.username }}</p>
        <p class="user-id">ID: {{ userStore.profile.user_id }}</p>
      </div>
      <button @click="openEditProfileModal" class="edit-profile-button">编辑资料</button>

      <div class="settings-panel">
    <h2>应用设置</h2>
    
    <!-- 主题色选择 -->
    <div class="setting-item">
      <label for="theme-color-picker">选择主题色:</label>
      <!-- 使用 v-model 直接双向绑定到 store 的状态 -->
      <input type="color" id="theme-color-picker" v-model="settingsStore.themeColor">
    </div>

    <!-- 字体大小选择 -->
    <div class="setting-item">
      <label>选择字体大小:</label>
      <div class="font-size-options">
        <button @click="settingsStore.fontSize = 'small'" :class="{active: settingsStore.fontSize === 'small'}">小</button>
        <button @click="settingsStore.fontSize = 'medium'" :class="{active: settingsStore.fontSize === 'medium'}">中</button>
        <button @click="settingsStore.fontSize = 'large'" :class="{active: settingsStore.fontSize === 'large'}">大</button>
      </div>
    </div>
  </div>
    </header>

    <!-- 2. 内容管理区 -->
    <main class="profile-content">
      <h2>我发布的表白</h2>
      <!-- 加载状态 -->
      <div v-if="userStore.isLoadingMyConfessions" class="loading">
        正在加载我的帖子...
      </div>
      
      <!-- 帖子列表 -->
      <div v-else-if="userStore.myConfessions.length > 0" class="confession-list">
        <!-- 【关键】使用 v-for 循环渲染真实的帖子数据 -->
        <div 
          class="confession-card" 
          v-for="confession in userStore.myConfessions" 
          :key="confession.id"
        >
          <p>{{ confession.content }}</p>
          <div class="card-actions">
            <button class="edit-button">编辑</button>
            <button class="delete-button">删除</button>
          </div>
        </div>
      </div>


        <p v-if="!userConfessions.length && !isLoading">你还没有发布任何表白哦，快去社区看看吧！</p>
      
    </main>
  </div>
  
  <!-- 加载状态 -->
  <div v-else class="loading-container">
    <p>正在加载用户信息...</p>
  </div>

  <!-- 编辑资料和更换头像的弹窗(Modal) -->
   <div v-if="isEditProfileModalVisible" class="modal-overlay" @click.self="closeEditProfileModal">
    <div class="modal-content">
      <h2>编辑个人资料</h2>
      <div class="form-group">
        <label for="nickname-input">昵称:</label>
        <input id="nickname-input" type="text" v-model="newNickname" />
      </div>
      <div class="modal-actions">
        <button @click="closeEditProfileModal" class="cancel-btn">取消</button>
        <button @click="handleProfileUpdate" class="save-btn">保存</button>
      </div>
    </div>
  </div>

<div v-if="isAvatarModalVisible" class="modal-overlay" @click.self="closeAvatarModal">
    <div class="modal-content">
      <h2>更换头像</h2>
      
      <!-- 文件选择 -->
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileChange" 
        accept="image/*" 
        style="display: none;" 
      />
      <button @click="triggerFileInput" class="choose-file-btn">选择图片</button>
      
      <!-- 图片预览 -->
      <div v-if="previewUrl" class="avatar-preview">
        <img :src="previewUrl" alt="头像预览" />
      </div>
      
      <div class="modal-actions">
        <button @click="closeAvatarModal" class="cancel-btn">取消</button>
        <button @click="handleUpload" class="save-btn" :disabled="!selectedFile">上传</button>
      </div>
    </div>
  </div>


</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue'; // 导入我们即将创建的导航栏组件
import { useSettingsStore } from '@/stores/settingsStore';
import axios from 'axios';

const userStore = useUserStore();
const defaultAvatar = 'https://i.pravatar.cc/150'; // 默认头像
const settingsStore = useSettingsStore();



// --- 模拟数据 ---
// 将来这里会通过API获取
const userConfessions = ref([1, 2, 3]); 
const isLoading = ref(false);

// 组件挂载时，确保用户信息被获取,获取我发布的帖子列表
onMounted(() => {
  userStore.fetchUserProfile();
  userStore.fetchMyConfessions();
});

//   编辑资料弹窗
const isEditProfileModalVisible = ref(false);
const newNickname = ref('');
const isUpdatingProfile = ref(false);

const openEditProfileModal = () => {
  newNickname.value = userStore.profile?.name || '';
  isEditProfileModalVisible.value = true;
};
const closeEditProfileModal = () => {
  isEditProfileModalVisible.value = false;
};
const handleProfileUpdate = async () => {
  if (!newNickname.value.trim() || newNickname.value === userStore.profile?.name) {
    closeEditProfileModal();
    return;
  }
  isUpdatingProfile.value = true;
  try {
    await userStore.updateProfile({ name: newNickname.value });
    alert('昵称更新成功！');
    closeEditProfileModal();
  } catch (error: any) {
    console.error('昵称更新失败:', error);
    alert(`更新失败: ${error.message}`);
  } finally {
    isUpdatingProfile.value = false;
  }
};

// --- 更换头像弹窗 ---
const isAvatarModalVisible = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isUploading = ref(false); // 新增一个上传加载状态

const openAvatarModal = () => {
  isAvatarModalVisible.value = true;
};
const closeAvatarModal = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  isAvatarModalVisible.value = false;
};
const triggerFileInput = () => {
  fileInput.value?.click();
};
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    // 可以在这里添加文件大小和类型的客户端校验
    selectedFile.value = target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile.value);
  }
};
const handleUpload = async () => {
  if (!selectedFile.value) {
    alert('请先选择一张图片。');
    return;
  }

  isUploading.value = true; // 开始上传，进入加载状态
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    // --- 第一步: 上传图片文件到专门的上传接口 ---
    const uploadResponse = await axios.post('/api/users/avatar', formData, {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (uploadResponse.data.code !== 0) {
      // 如果上传本身就失败了，直接抛出错误
      throw new Error(uploadResponse.data.msg || '图片上传服务失败');
    }

    // 从上传接口的响应中获取新的图片URL
    const newAvatarUrl = uploadResponse.data.data.url;

    // --- 第二步: 调用 userStore 的 action 来更新用户信息 ---
    // 将新的头像 URL 保存到用户的个人资料中
    await userStore.updateProfile({ avatar: newAvatarUrl });

    // 如果上面两步都顺利执行完毕，说明整个流程成功
    alert('头像更换成功！');
    closeAvatarModal();

  } catch (error: any) {
    console.error('更换头像失败:', error);
    alert(`操作失败: ${error.message}`);
  } finally {
    isUploading.value = false; // 无论成功失败，结束加载状态
  }
};
</script>

<!-- 加载状态 -->
  <div v-else class="loading-container">
    <p>正在加载用户信息...</p>
  </div>

