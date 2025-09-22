<template>
  <AppHeader />
  <div class="messages-page">
    <h1>我的消息</h1>
    
    <div v-if="userStore.isLoadingNotifications" class="loading">正在加载...</div>
    
    <div v-else-if="userStore.notifications.length > 0" class="message-list">
      <!-- 用 v-for 循环渲染真实的消息列表 -->
      <div 
        v-for="notification in userStore.notifications" 
        :key="notification.id" 
        class="message-item"
        :class="{ 'is-unread': !notification.isRead }"
      >
        <p>
          <!-- 这里可以根据 notification.type 显示不同内容 -->
          <strong>{{ notification.actor.name }}</strong> 评论了你的表白: "{{ notification.relatedContent.textSnippet }}"
        </p>
        <span class="timestamp">{{ new Date(notification.createdAt).toLocaleString() }}</span>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>你还没有收到任何消息哦。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import { useUserStore } from '@/stores/userStore';
import { onMounted } from 'vue';

const userStore = useUserStore();

// 当用户进入这个页面时:
onMounted(() => {
  // 1. 获取完整的消息列表
  userStore.fetchNotifications();
  // 2. 将所有消息标记为已读 (这会自动更新小红点)
  userStore.markAllAsRead();
});
</script>