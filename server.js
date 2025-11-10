const express = require('express');
const http = require('http');
const path = require('path'); // استدعاء مكتبة path للتعامل مع المسارات
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 2. تهيئة Socket.IO وربطه بخادم HTTP
//    نضيف إعدادات CORS للسماح للواجهة الأمامية (التي ستعمل على منفذ مختلف) بالاتصال بهذا الخادم
const io = new Server(server, {
  cors: {
    origin: "*", // حاليًا نسمح بالاتصال من أي مصدر، لاحقًا يمكن تقييده
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// لتخزين المستخدمين المتصلين (id => name)
const users = {};

// تقديم الملفات الثابتة (HTML, CSS, JS) من المجلد الحالي بشكل صحيح
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
  // هذا الكود يتم تنفيذه عندما يقوم مستخدم جديد بفتح التطبيق والاتصال بالخادم
  console.log(`مستخدم جديد اتصل: ${socket.id}`);

  // 1. الاستماع لحدث تعيين اسم المستخدم
  socket.on('set username', (userName) => {
    // تخزين اسم المستخدم
    users[socket.id] = { name: userName };
    console.log(`المستخدم ${socket.id} اختار الاسم: ${userName}`);

    // 2. إرسال قائمة المستخدمين المحدثة للجميع
    io.emit('users', Object.values(users));

    // 3. إرسال رسالة "انضمام" لكل المستخدمين ما عدا المستخدم الجديد نفسه
    socket.broadcast.emit('system message', {
      text: `${userName} انضم إلى الدردشة`
    });
  });

  // الاستماع لحدث 'chat message' من العميل
  socket.on('chat message', (msg) => {
    if (!users[socket.id]) return; // تجاهل الرسائل قبل اختيار الاسم
    console.log(`رسالة من ${users[socket.id].name}: ${msg}`);

    // إعادة بث الرسالة إلى "جميع" العملاء المتصلين
    // مع إرفاق هوية واسم المرسل ونص الرسالة
    io.emit('chat message', {
        id: socket.id,
        name: users[socket.id].name,
        text: msg
    });
  });

  // هذا الكود يتم تنفيذه عندما يقوم مستخدم بإغلاق التطبيق أو فقدان الاتصال
  socket.on('disconnect', () => {
    const disconnectedUser = users[socket.id];
    if (!disconnectedUser) return;

    console.log(`مستخدم قطع الاتصال: ${disconnectedUser.name}`);
    
    // حذف المستخدم من القائمة
    delete users[socket.id];

    // إرسال قائمة المستخدمين المحدثة للجميع
    io.emit('users', Object.values(users));

    // إرسال رسالة "مغادرة" للجميع
    io.emit('system message', { text: `${disconnectedUser.name} غادر الدردشة` });
  });
});

server.listen(PORT, () => {
  console.log(`السيرفر يعمل الآن على http://localhost:${PORT}`);
});
