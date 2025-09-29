import { createRouter, createWebHistory } from 'vue-router';
    import LoginRegisterView from '../views/LoginRegisterView.vue';
    
    const router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes: [
        {
          // 根路径重定向到认证页
          path: '/',
          redirect: '/auth'
        },
        {
          // 认证页 (登录/注册)
          path: '/auth',
          name: 'auth',
          component: LoginRegisterView
        },
        {
          // 社区主页
          path: '/community',
          name: 'community',
          // 使用路由懒加载，优化性能
          component: () => import('../views/CommunityView.vue'),
          // meta字段用于定义路由元信息，比如“这个页面需要登录”
          meta: { requiresAuth: true }
        },
        {
        path: '/profile', // 个人页面的访问地址
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { requiresAuth: true } // 【关键】确保这个页面需要登录才能访问
        },
      ]
    });

    // 全局前置路由守卫
    router.beforeEach((to, from, next) => {
      // 尝试从 localStorage 获取 token
      const token = localStorage.getItem('access-token');

      // 检查目标路由是否需要认证
      if (to.meta.requiresAuth && !token) {
        // 如果需要认证，但用户没有 token，则强制跳转到认证页面
        next({ name: 'auth' });
      } else {
        // 否则，正常放行
        next();
      }
    });

    export default router;