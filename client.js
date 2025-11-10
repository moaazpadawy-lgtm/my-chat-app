// تحديد رابط الخادم (backend) حسب البيئة
const backendUrl =
  window.location.hostname === "localhost" || window.location.hostname === "192.168.43.150"
    ? "http://localhost:3002" // البورت المحلي للسيرفر
    : "http://192.168.43.150:3002"; // للسيرفر على الشبكة المحلية

// إنشاء اتصال مع السيرفر عبر Socket.io
const socket = io(backendUrl);

document.addEventListener("DOMContentLoaded", () => {
  // عناصر DOM الأساسية
  const chatBox = document.getElementById("chat-box");
  const chatContainer = document.getElementById("chat-container");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const usersList = document.getElementById("users-list");
  const logoutBtn = document.getElementById("logout-btn");
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.querySelector(".sidebar");
  const chatMain = document.querySelector(".chat-main");

  // عناصر اختيار الاسم
  const usernameModal = document.getElementById("username-modal");
  const usernameForm = document.getElementById("username-form");
  const usernameInput = document.getElementById("username-input");

  // فتح/إغلاق القائمة في الموبايل
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("open");
  });

  chatMain.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // عند إرسال الاسم
  usernameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
      socket.emit("set username", username);
      usernameModal.style.display = "none";
      chatContainer.style.display = "flex";
    }
  });

  // عند إرسال رسالة
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (msg) {
      socket.emit("chat message", msg);
      messageInput.value = "";
    }
  });

  // استقبال رسالة من السيرفر
  socket.on("chat message", (data) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (data.id === socket.id) {
      messageElement.classList.add("my-message");
      messageElement.innerText = `أنا: ${data.text}`;
    } else {
      messageElement.classList.add("other-message");
      messageElement.innerText = `${data.name || "مجهول"}: ${data.text}`;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // استقبال رسائل النظام
  socket.on("system message", (data) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("system-message");
    messageElement.innerText = data.text;

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // استقبال قائمة المستخدمين
  socket.on("users", (users) => {
    usersList.innerHTML = "";
    users.forEach((user) => {
      const li = document.createElement("li");
      li.innerText = user.name || "مستخدم مجهول";
      usersList.appendChild(li);
    });
  });

  // زر تسجيل الخروج
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  });
});
