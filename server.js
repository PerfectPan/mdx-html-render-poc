import express from 'express';
import cors from 'cors';
import { compile } from './mdx.js';

const app = express();
const port = 3000;

const presetMDX = `
# Hello Markdown

This is a simple markdown example.

- List item 1
- List item 2
- List item 3

**Bold text** and _italic text_.

<button skill="skillid" />

\`\`\`js
console.log('sdsd;');
\`\`\`
`;

app.use(cors());

app.get('/events', (req, res) => {
  // 设置HTTP头部，以告诉客户端这是一个SSE连接
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let idx = 0;
  let lastValid = 0;
  let lastMessage = '';
  const fn = () => {
    if (idx >= presetMDX.length) {
      return;
    }
    compile(presetMDX.substring(0, idx))
      .then((message) => {
        lastValid = idx;
        lastMessage = message;
        res.write(
          `data: ${JSON.stringify({
            content: message,
          })}\n\n`
        );
        idx += 1;
        setTimeout(fn, 100);
      })
      .catch(() => {
        res.write(
          `data: ${JSON.stringify({
            content: `${lastMessage}${presetMDX.substring(lastValid, idx)}`,
          })}\n\n`
        );
        idx += 1;
        setTimeout(fn, 100);
      });
  };

  setTimeout(fn, 100);

  // 当客户端关闭连接时清理资源
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
