<template>
  <div class="page-container">
    <div class="container" :class="{'right-panel-active': isSignUp}" id="container">
      <!-- 注册表单 -->
      <div class="form-container sign-up-container">
        <form @submit.prevent="handleSignUp">
          <h1>创建账户</h1>
          <span>填写下面的信息来注册</span>
          <input type="text" placeholder="登录名 (不可修改)" v-model="signUpUsername" required />
          <input type="text" placeholder="昵称" v-model="signUpNickname" required />
          <input type="password" placeholder="密码" v-model="signUpPassword" required />
          <button type="submit">注 册</button>
        </form>
      </div>

      <!-- 登录表单 -->
      <div class="form-container sign-in-container">
        <form @submit.prevent="handleLogin">
          <h1>登 录</h1>
          <span>使用您的账户</span>
          <input type="text" placeholder="登录名" v-model="loginUsername" required />
          <input type="password" placeholder="密码" v-model="loginPassword" required />
          <a href="#">忘记密码?</a>
          <button type="submit">登 录</button>
        </form>
      </div>

      <!-- 覆盖层 -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>已有账户？</h1>
            <p>请使用您的账户信息直接登录</p>
            <button class="ghost" @click="isSignUp = false">去登录</button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1>没有账户？</h1>
            <p>立即注册，加入我们，开启一段新的旅程！</p>
            <button class="ghost" @click="isSignUp = true">去注册</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const isSignUp = ref(false);
const userStore = useUserStore();
const router = useRouter();

// 登录表单数据
const loginUsername = ref<string>('');
const loginPassword = ref<string>('');

// 注册表单数据
const signUpUsername = ref<string>('');
const signUpNickname = ref<string>('');
const signUpPassword = ref<string>('');

// 【最终版】处理登录
const handleLogin = async () => {
  try {
    // 调用 Pinia store 中真实的登录 action
    await userStore.login({ 
      username: loginUsername.value, 
      password: loginPassword.value 
    });
    
    // 如果 await 顺利执行完（没有抛出错误），说明登录成功
    alert('登录成功！');
    // 跳转到社区主页
    router.push('/community'); 

  } catch (error: any) {
    // 如果 store 中的 action 抛出错误，这里的 catch 会捕获到
    console.error('登录失败:', error);
    // 向用户显示后端返回的错误信息
    alert(`登录失败: ${error.message}`);
  }
};

// 【最终版】处理注册
const handleSignUp = async () => {
  try {
    // 调用 Pinia store 中真实的注册 action
    await userStore.register({ 
      username: signUpUsername.value, 
      name: signUpNickname.value, 
      password: signUpPassword.value 
    });
    
    alert('注册成功！将自动切换到登录界面，请使用新账户登录。');
    // 注册成功后，切换到登录面板
    isSignUp.value = false;
    
  } catch (error: any) {
    console.error('注册失败:', error);
    alert(`注册失败: ${error.message}`);
  }
};
</script>


<style scoped>
:root {
  --white: #e9e9e9;
  --gray: #333;
  --blue: #0367a6;
  --lightblue: #008997;
  --button-radius: 0.7rem;
}

.page-container {
  display: flex; /* 使用 flex 替代 grid */
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: var(--white); /* 纯色背景 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

@media (max-width: 1200px) {
    .page-container {
        transform: scale(0.7);
}
}
@media (max-width: 1000px) {
    .page-container {
        transform: scale(0.6);
}
}
@media (max-width: 800px) {
    .page-container {
        transform: scale(0.5);
}
}
@media (max-width: 600px) {
    .page-container {
        transform: scale(0.4);
}
}

.container {
  background-color: var(--white);
  border-radius: var(--button-radius);
  box-shadow: 0 0.9rem 1.7rem rgba(0, 0, 0, 0.25);
  height: 480px; /* 使用固定高度 */
  max-width: 768px; /* 使用固定宽度 */
  overflow: hidden;
  position: relative;
  width: 100%;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  background-color: #ffffff;
}

.form-container form {
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 3rem;
  height: 100%;
  text-align: center;
}

.form-container h1 {
  font-weight: 300;
  margin: 0;
  margin-bottom: 1.25rem;
}

.form-container span {
  font-size: 12px;
  margin-bottom: 10px;
}

.form-container input {
  background-color: #eee;
  border: none;
  border-radius: 5px;
  padding: 0.9rem 0.9rem;
  margin: 0.5rem 0;
  width: 100%;
}

.form-container a {
  color: var(--gray);
  font-size: 0.9rem;
  margin: 1.5rem 0;
  text-decoration: none;
}

button {
  background-color: var(--blue);
  background-image: linear-gradient(90deg, var(--blue) 0%, var(--lightblue) 74%);
  border-radius: 20px;
  border: 1px solid var(--blue);
  color: var(--white);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.1rem;
  padding: 0.9rem 4rem;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
}

/* 覆盖层上的按钮样式 */
button.ghost {
  background-color: transparent;
  border-color: #FFFFFF;
}

.form-container form button {
  margin-top: 1.5rem;
}

/* 登录和注册表单的初始位置和动画 */
.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  opacity: 0;
  width: 50%;
  z-index: 1;
}

.container.right-panel-active .sign-up-container {
  animation: show 0.6s;
  opacity: 1;
  transform: translateX(100%);
  z-index: 5;
}

/* 覆盖层样式，替代 .container_overlay 和 .overlay */
.overlay-container {
  height: 100%;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 0;
  transition: transform 0.6s ease-in-out;
  width: 50%;
  z-index: 100;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background-color: var(--lightblue);
  background: linear-gradient(to right, #ff4b2b, #ff416c); /* 渐变背景 */
  color: #FFFFFF;
  height: 100%;
  left: -100%;
  position: relative;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  width: 200%;
}
.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  text-align: center;
  top: 0;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  width: 50%;
  padding: 0 40px;
}

.overlay-panel h1 {
    font-weight: bold;
    margin: 0;
}

.overlay-panel p {
    font-size: 14px;
    font-weight: 100;
    line-height: 20px;
    letter-spacing: 0.5px;
    margin: 20px 0 30px;
}

.overlay-left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

/* 动画 */
@keyframes show {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }

  50%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}



</style>