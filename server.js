const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 在这里配置你的 API Key
const API_KEY = 'sk-tyybrrsbdgsrokdkguleqvnjjevmwivwzxykisgzxhnvzvdf';
const API_BASE = 'api.siliconflow.cn';
const MODEL = 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B';

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// 系统提示词
const SYSTEM_PROMPT = `你是一个专业的心理健康助手，专门帮助用户处理情绪问题、压力和心理健康挑战。
你的特点：温暖、同理心强、不带评判、基于心理学原理（CBT、正念等）提供建议、鼓励用户表达情绪、提供实用的应对策略和放松技巧、在适当时候推荐呼吸练习或正念技巧、使用中文回复，保持自然对话风格。
重要原则：不提供医疗诊断或药物建议、鼓励寻求专业帮助当需要时、保持积极但现实的观点、尊重用户的感受和经历。
回复风格：像一位理解你的朋友，提供支持和实用建议。`;

const server = http.createServer((req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API 路由
  if (req.url === '/api/chat' && req.method === 'POST') {
    handleChatRequest(req, res);
    return;
  }

  // 静态文件服务
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

function handleChatRequest(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { message } = JSON.parse(body);

      const apiReq = https.request({
        hostname: API_BASE,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }, (apiRes) => {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
        apiRes.pipe(res);
      });

      apiReq.on('error', (error) => {
        console.error('API request error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API request failed' }));
      });

      apiReq.write(JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true
      }));

      apiReq.end();
    } catch (error) {
      console.error('Error parsing request:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Key configured: ${API_KEY.substring(0, 10)}...`);
});
