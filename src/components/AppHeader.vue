<template>
  <header class="app-header">
    <nav class="nav-links">
      <RouterLink to="/community" class="nav-link">社区</RouterLink>
      <RouterLink to="/messages" class="nav-link">
        我的消息
        <span v-if="userStore.hasNewMessages" class="notification-dot"></span>
      </RouterLink>
      <RouterLink to="/profile" class="nav-link">我的主页</RouterLink>
    </nav>
    <div class="user-actions">
      <span v-if="userStore.profile">欢迎, {{ userStore.profile.name }}</span>
      <button @click="userStore.logout()">退出登录</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { RouterLink } from 'vue-router';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  // 只有在登录状态下才去获取
  if (userStore.isLoggedIn) {
    userStore.fetchUnreadCount();
  }
});
</script>
