<template>
  <div class="page-container">
    <div class="container" :class="{'right-panel-active': isSignUp}" id="container">
      <!-- 注册表单 -->
      <div class="form-container sign-up-container">
        <form @submit.prevent="handleSignUp">
          <h1>创建账户</h1>
          <span>填写下面的信息来注册</span>
          <input type="text" placeholder="登录名" v-model="signUpUsername" required />
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
            <p>加入我们，开启一段新的旅程！</p>
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

const isSignUp = ref(false);
const userStore = useUserStore();
const isLoading = ref(false);
const errorMessage = ref('');


// 登录表单数据
const loginUsername = ref('');
const loginPassword = ref('');

// 注册表单数据
const signUpUsername = ref('');
const signUpNickname = ref('');
const signUpPassword = ref('');

// 【最终版】处理登录
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // 调用 Pinia store 中真实的登录 action
    await userStore.login({ 
      username: loginUsername.value, 
      password: loginPassword.value 
    });
    

  } catch (error: any) {
    // 登录失败，显示错误信息
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

// 【最终版】处理注册
const handleSignUp = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // 调用 Pinia store 中真实的注册 action
    await userStore.register({ 
      username: signUpUsername.value, 
      name: signUpNickname.value, 
      password: signUpPassword.value,
      usertype: 1,
    });
    
    alert('注册成功！将自动切换到登录界面，请使用新账户登录。');
    // 注册成功后，切换到登录面板
    isSignUp.value = false;
    
  } catch (error: any) {
    console.error('注册失败:', error);
    alert(`注册失败: ${error.message}`);
  }
};

const togglePanel = (isSigningUp: boolean) => {
  isSignUp.value = isSigningUp;
  errorMessage.value = '';
  // 清空表单数据，提升体验
  loginUsername.value = '';
  loginPassword.value = '';
  signUpUsername.value = '';
  signUpNickname.value = '';
  signUpPassword.value = '';
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

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
  font-family: 'Montserrat', sans-serif;
}

h1 {
  font-weight: bold;
  margin: 0;
  color: var(--text-color-primary);
  font-size: var(--font-size-h1);
}

p {
  font-size: var(--font-size-medium);
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}

span {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  margin-bottom: 10px;
}

a {
  color: var(--text-color-secondary);
  font-size: var(--font-size-medium);
  text-decoration: none;
  margin: 15px 0;
}
a:hover {
  color: var(--primary-color);
}

button {
  border-radius: 20px;
  border: 1px solid var(--primary-color);
  background-color: var(--primary-color);
  color: var(--text-on-primary-color);
  font-size: var(--font-size-small);
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
}

button.ghost {
  background-color: transparent;
  border-color: var(--text-on-primary-color);
}

form {
  background-color: var(--container-background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

input {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  border-radius: 8px;
  outline: none;
  font-size: var(--font-size-medium);
}
input:focus {
  border-color: var(--primary-color);
}

.container {
  background-color: var(--container-background-color);
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  background-color: var(--container-background-color); /* 确保背景不透明 */
}

/* ... 其他滑动动画的CSS保持不变 ... */
/* 比如 .sign-in-container, .overlay-container 等 */
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
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.container.right-panel-active .sign-up-container {
  animation: show 0.6s;
  opacity: 1;
  transform: translateX(100%);
  z-index: 5;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container{
  transform: translateX(-100%);
}

.overlay {
  background: var(--primary-color);
  background-image: linear-gradient(to right, var(--primary-color-soft) , var(--primary-color));
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: var(--text-on-primary-color);
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
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

@keyframes show {
  0%, 49.99% { opacity: 0; z-index: 1; }
  50%, 100% { opacity: 1; z-index: 5; }
}


</style>