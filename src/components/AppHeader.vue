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

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--container-background-color);
  border-bottom: 1px solid var(--border-color);
  position: sticky; /* 让导航栏在滚动时固定在顶部 */
  top: 0;
  z-index: 10; /* 确保在最上层 */
}
.nav-links {
  display: flex;
  gap: 1.5rem;
}
.nav-link {
  position: relative;
  text-decoration: none;
  color: var(--text-color-secondary);
  font-weight: 600;
  font-size: var(--font-size-medium);
  transition: color 0.2s;
}
.nav-link:hover {
  color: var(--text-color-primary);
}
/* 当前激活的路由链接样式 */
.nav-link.router-link-exact-active {
  color: var(--primary-color);
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-color-secondary);
  font-size: var(--font-size-small);
}
.user-actions button {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color-secondary);
  padding: 0.5rem 1rem;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
}
.user-actions button:hover {
  background: var(--border-color);
  color: var(--text-color-primary);
}
.notification-dot {
  position: absolute;
  top: -2px;
  right: -8px;
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  border: 1px solid var(--container-background-color);
}
</style>