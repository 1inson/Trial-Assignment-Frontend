<template>
  <!-- 添加一个全局导航栏，方便用户在页面间跳转 -->
  <AppHeader />

  <div class="profile-page" v-if="userStore.profile">
    <!-- 1. 顶部信息展示区 -->
    <header class="profile-header">
      <div class="avatar-container">
        <img :src="userStore.profile.avatarUrl || defaultAvatar" alt="用户头像" class="avatar">
        <button class="edit-avatar-button" @click="openAvatarModal">更换头像</button>
      </div>
      <div class="user-info">
        <h1 class="nickname">{{ userStore.profile.name }}</h1>
        <p class="username">@{{ userStore.profile.username }}</p>
        <p class="user-id">ID: {{ userStore.profile.id }}</p>
      </div>
      <button @click="openEditProfileModal" class="edit-profile-button">编辑资料</button>
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

  <!-- TODO: 在这里添加编辑资料和更换头像的弹窗(Modal) -->

</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue'; // 导入我们即将创建的导航栏组件

const userStore = useUserStore();
const defaultAvatar = 'https://i.pravatar.cc/150'; // 默认头像

// --- 模拟数据 ---
// 将来这里会通过API获取
const userConfessions = ref([1, 2, 3]); 
const isLoading = ref(false);

// 组件挂载时，确保用户信息被获取,获取我发布的帖子列表
onMounted(() => {
  userStore.fetchUserProfile();
  userStore.fetchMyConfessions();
});

// --- 弹窗相关逻辑 (暂时为空) ---
const openEditProfileModal = () => {
  alert('功能待开发：打开编辑资料弹窗');
};

const openAvatarModal = () => {
  alert('功能待开发：打开更换头像弹窗');
};
</script>

<!-- 加载状态 -->
  <div v-else class="loading-container">
    <p>正在加载用户信息...</p>
  </div>

