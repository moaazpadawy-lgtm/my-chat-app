const socket = io();

// DOM elements
const chatBox = document.getElementById('chat-box');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const usersList = document.getElementById('users-list');
const logoutBtn = document.getElementById('logout-btn');
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.querySelector('.sidebar');
const chatMain = document.querySelector('.chat-main');

// عناصر شاشة اختيار الاسم
const usernameModal = document.getElementById('username-modal');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');

// تشغيل زر القائمة للموبايل
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // منع انتشار الحدث لأعلى (لمنع إغلاق القائمة فورًا)
  sidebar.classList.toggle('open');
});

chatMain.addEventListener('click', () => {
  // إغلاق القائمة عند الضغط على أي مكان في منطقة الشات
  sidebar.classList.remove('open');
});

// عند إرسال الاسم
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    // إرسال الاسم إلى الخادم
    socket.emit('set username', username);
    // إخفاء شاشة اختيار الاسم وإظهار الدردشة
    usernameModal.style.display = 'none';
    chatContainer.style.display = 'flex';
  }
});

// إرسال الرسائل للخادم
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if(msg){
    socket.emit('chat message', msg);
    messageInput.value = '';
  }
});

// استقبال الرسائل من الخادم
socket.on('chat message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  if(data.id === socket.id){
    messageElement.classList.add('my-message');
    messageElement.innerText = `أنا: ${data.text}`;
  } else {
    messageElement.classList.add('other-message');
    messageElement.innerText = `${data.name || 'مجهول'}: ${data.text}`;
  }

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// استقبال رسائل النظام (انضمام/مغادرة)
socket.on('system message', (data) => {
  const messageElement = document.createElement('div');
  // استخدام كلاس خاص لرسائل النظام
  messageElement.classList.add('system-message');
  messageElement.innerText = data.text;

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// استقبال قائمة المستخدمين المتصلين
socket.on('users', (users) => {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerText = user.name || 'مستخدم مجهول';
    usersList.appendChild(li);
  });
});

// زر تسجيل الخروج
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken'); // أو sessionStorage حسب نوع المستخدم
  window.location.href = '/'; // إعادة توجيه للصفحة الرئيسية
});