// ==================== API 配置 ====================
const DEFAULT_API_CONFIG = {
  apiKey: 'sk-tyybrrsbdgsrokdkguleqvnjjevmwivwzxykisgzxhnvzvdf',
  baseURL: 'https://api.siliconflow.cn/v1',
  modelName: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'
};

// 从 localStorage 加载 API 配置
function loadApiConfig() {
  const saved = localStorage.getItem('aura_api_config');
  if (saved) {
    return JSON.parse(saved);
  }
  return DEFAULT_API_CONFIG;
}

// 保存 API 配置到 localStorage
function saveApiConfig(config) {
  localStorage.setItem('aura_api_config', JSON.stringify(config));
}

let apiConfig = loadApiConfig();

// ==================== 呼吸练习 ====================
const breathingPhases = [
  { name: '吸气', duration: 4000, scale: 1.4 },
  { name: '屏住呼吸', duration: 4000, scale: 1.4 },
  { name: '呼气', duration: 4000, scale: 1.0 },
  { name: '屏住呼吸', duration: 4000, scale: 1.0 }
];

const breathingRing = document.getElementById('breathingRing');
const dustCanvas = document.getElementById('dustCanvas');
const ringCanvas = document.getElementById('ringCanvas');
const breathingPhaseLabel = document.getElementById('breathingPhase');
const breathingToggle = document.getElementById('breathingToggle');

let breathingActive = false;
let breathingTimer = null;
let breathingParticles = null;
let breathingParticleSize = 0;

function generateBreathingParticles(size) {
  const center = size / 2;
  const baseRadius = size * (90 / 280);
  const particles = [];

  const pushRingParticles = (count, radiusMin, radiusMax, sizeMin, sizeMax, opacityMin, opacityMax) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      particles.push({
        x, y,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        opacity: opacityMin + Math.random() * (opacityMax - opacityMin),
        type: 'ring'
      });
    }
  };

  const pushDustParticles = (count, width, height, sizeMin, sizeMax, opacityMin, opacityMax) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        opacity: opacityMin + Math.random() * (opacityMax - opacityMin),
        type: 'dust'
      });
    }
  };

  pushDustParticles(50, size, size, 1, 2, 0.1, 0.5);
  pushRingParticles(600, baseRadius * 0.9, baseRadius * 1.1, 1, 3, 0.2, 0.7);
  pushRingParticles(300, baseRadius * 0.8, baseRadius * 0.88, 0.5, 1.5, 0.1, 0.4);
  pushRingParticles(300, baseRadius * 1.12, baseRadius * 1.2, 0.5, 1.5, 0.1, 0.4);

  return particles;
}

function renderBreathingRing() {
  if (!dustCanvas || !ringCanvas || !breathingRing) return;
  
  const dustCtx = dustCanvas.getContext('2d');
  const ringCtx = ringCanvas.getContext('2d');
  if (!dustCtx || !ringCtx) return;

  const size = 280;
  if (size !== breathingParticleSize) {
    breathingParticles = generateBreathingParticles(size);
    breathingParticleSize = size;
  }
  
  const dpr = window.devicePixelRatio || 1;

  dustCanvas.width = Math.floor(size * dpr);
  dustCanvas.height = Math.floor(size * dpr);
  dustCanvas.style.width = `${size}px`;
  dustCanvas.style.height = `${size}px`;

  ringCanvas.width = Math.floor(size * dpr);
  ringCanvas.height = Math.floor(size * dpr);
  ringCanvas.style.width = `${size}px`;
  ringCanvas.style.height = `${size}px`;

  dustCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dustCtx.clearRect(0, 0, size, size);

  ringCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ringCtx.clearRect(0, 0, size, size);

  const teal = '42, 157, 143';
  if (!breathingParticles) return;

  const dustParticles = breathingParticles.filter(p => p.type === 'dust');
  const ringParticles = breathingParticles.filter(p => p.type === 'ring');

  dustParticles.forEach((particle) => {
    dustCtx.fillStyle = `rgba(${teal}, ${particle.opacity * 0.5})`;
    dustCtx.beginPath();
    dustCtx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
    dustCtx.fill();
  });

  ringParticles.forEach((particle) => {
    ringCtx.fillStyle = `rgba(${teal}, ${particle.opacity})`;
    ringCtx.beginPath();
    ringCtx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
    ringCtx.fill();
  });
}

function applyBreathingScale(scale, duration = 1000) {
  breathingRing.style.transition = `transform ${duration}ms ease-in-out`;
  breathingRing.style.transform = `scale(${scale})`;
}

function runBreathingPhase(index) {
  if (!breathingActive) return;
  const phase = breathingPhases[index];
  breathingPhaseLabel.textContent = phase.name;
  applyBreathingScale(phase.scale, phase.duration);
  breathingTimer = setTimeout(() => {
    runBreathingPhase((index + 1) % breathingPhases.length);
  }, phase.duration);
}

function stopBreathing() {
  breathingActive = false;
  if (breathingTimer) clearTimeout(breathingTimer);
  breathingPhaseLabel.textContent = '准备开始';
  applyBreathingScale(1.0, 1000);
  breathingToggle.textContent = '开始';
  breathingToggle.classList.remove('stop');
}

renderBreathingRing();

breathingToggle.addEventListener('click', () => {
  breathingActive = !breathingActive;
  if (breathingActive) {
    breathingToggle.textContent = '停止';
    breathingToggle.classList.add('stop');
    runBreathingPhase(0);
  } else {
    stopBreathing();
  }
});

// 白噪音选择
const soundButtons = document.querySelectorAll('.sound-btn');
const audioMap = {
  none: null,
  rain: document.getElementById('audio-rain'),
  forest: document.getElementById('audio-forest'),
  waves: document.getElementById('audio-waves')
};

function stopAllSounds() {
  Object.values(audioMap).forEach((audio) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  });
}

soundButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const sound = btn.dataset.sound;
    
    soundButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    stopAllSounds();
    
    if (sound !== 'none' && audioMap[sound]) {
      audioMap[sound].play().catch(() => {});
    }
  });
});

// ==================== 页面切换 ====================
const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page-content');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    pages.forEach(page => {
      page.classList.remove('active');
      if (page.id === `page-${targetTab}`) {
        page.classList.add('active');
      }
    });

    if (targetTab === 'chat') {
      setTimeout(renderChatRing, 100);
    }
  });
});

// ==================== 感官接地练习 ====================
const groundingSteps = [
  { prompt: '深呼吸。现在，环顾四周，说出你看到的5样东西。', count: 5 },
  { prompt: '很好。现在，专注于你身体能感觉到的4种触感。', count: 4 },
  { prompt: '仔细听。你能听到的3种声音是什么？', count: 3 },
  { prompt: '你闻到了哪2种气味？', count: 2 },
  { prompt: '最后，你能尝到的1种味道是什么？', count: 1 }
];

let currentStep = 0;
let userInputs = [];

const stepPrompt = document.getElementById('stepPrompt');
const inputsContainer = document.getElementById('inputsContainer');
const nextStepBtn = document.getElementById('nextStepBtn');
const groundingStepsEl = document.getElementById('groundingSteps');
const groundingComplete = document.getElementById('groundingComplete');
const restartBtn = document.getElementById('restartBtn');
const progressDots = document.querySelectorAll('.progress-dots .dot');

function renderGroundingStep() {
  const step = groundingSteps[currentStep];
  stepPrompt.textContent = step.prompt;

  inputsContainer.innerHTML = '';
  for (let i = 0; i < step.count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'grounding-input';
    input.placeholder = `第${i + 1}项`;
    input.value = userInputs[currentStep * 5 + i] || '';
    input.addEventListener('input', (e) => {
      userInputs[currentStep * 5 + i] = e.target.value;
    });
    inputsContainer.appendChild(input);
  }

  nextStepBtn.textContent = currentStep < groundingSteps.length - 1 ? '下一步' : '完成';

  progressDots.forEach((dot, index) => {
    dot.classList.toggle('active', index <= currentStep);
  });
}

function nextStep() {
  if (currentStep < groundingSteps.length - 1) {
    currentStep++;
    renderGroundingStep();
  } else {
    groundingStepsEl.classList.add('hidden');
    groundingComplete.classList.remove('hidden');
  }
}

function restartGrounding() {
  currentStep = 0;
  userInputs = [];
  groundingStepsEl.classList.remove('hidden');
  groundingComplete.classList.add('hidden');
  renderGroundingStep();
}

nextStepBtn.addEventListener('click', nextStep);
restartBtn.addEventListener('click', restartGrounding);

renderGroundingStep();

// ==================== 回声树洞 ====================
const emotions = [
  { value: '焦虑', emoji: '😰', desc: '感到担心、紧张或不安' },
  { value: '压力', emoji: '😣', desc: '感到压力重重' },
  { value: '悲伤', emoji: '😢', desc: '感到悲伤、沮丧' },
  { value: '愤怒', emoji: '😠', desc: '感到愤怒、烦躁' },
  { value: '孤独', emoji: '😔', desc: '感到孤独、寂寞' },
  { value: '困惑', emoji: '🤔', desc: '感到困惑、迷茫' },
  { value: '感恩', emoji: '🙏', desc: '感到感恩、感激' },
  { value: '快乐', emoji: '😊', desc: '感到快乐、开心' },
  { value: '中性', emoji: '😐', desc: '感觉平静或中性' }
];

let messages = [];
let isTyping = false;

const welcomeMessages = [
  '你好，我是你的心理健康助手。我在这里倾听你的心声，帮助你缓解压力和焦虑。',
  '今天感觉怎么样？有什么想和我分享的吗？',
  '记住，寻求帮助是勇敢的表现。我们可以一起聊聊你的感受。'
];

const messagesContainer = document.getElementById('messagesContainer');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const moodTriggerBtn = document.getElementById('moodTriggerBtn');
const moodCancelBtn = document.getElementById('moodCancelBtn');
const quickMoodSelector = document.getElementById('quickMoodSelector');
const moodGrid = document.getElementById('moodGrid');
const clearChatBtn = document.getElementById('clearChatBtn');

// API 设置相关元素
const apiSettingsBtn = document.getElementById('apiSettingsBtn');
const apiSettingsModal = document.getElementById('apiSettingsModal');
const closeApiSettings = document.getElementById('closeApiSettings');
const saveApiBtn = document.getElementById('saveApiBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiBaseInput = document.getElementById('apiBaseInput');
const apiModelInput = document.getElementById('apiModelInput');
const apiStatus = document.getElementById('apiStatus');

// 加载已保存的 API 配置到输入框
function loadApiSettingsToInputs() {
  apiKeyInput.value = apiConfig.apiKey || '';
  apiBaseInput.value = apiConfig.baseURL || '';
  apiModelInput.value = apiConfig.modelName || '';
}

// 打开 API 设置
apiSettingsBtn.addEventListener('click', () => {
  loadApiSettingsToInputs();
  apiSettingsModal.classList.remove('hidden');
  apiStatus.textContent = '';
  apiStatus.className = 'api-status';
});

// 关闭 API 设置
closeApiSettings.addEventListener('click', () => {
  apiSettingsModal.classList.add('hidden');
});

// 点击模态框背景关闭
apiSettingsModal.addEventListener('click', (e) => {
  if (e.target === apiSettingsModal) {
    apiSettingsModal.classList.add('hidden');
  }
});

// 保存 API 设置
saveApiBtn.addEventListener('click', () => {
  const newConfig = {
    apiKey: apiKeyInput.value.trim(),
    baseURL: apiBaseInput.value.trim() || DEFAULT_API_CONFIG.baseURL,
    modelName: apiModelInput.value.trim() || DEFAULT_API_CONFIG.modelName
  };
  
  apiConfig = newConfig;
  saveApiConfig(apiConfig);
  
  apiStatus.textContent = '设置已保存';
  apiStatus.className = 'api-status success';
  
  setTimeout(() => {
    apiSettingsModal.classList.add('hidden');
  }, 1000);
});

function renderMoodButtons() {
  moodGrid.innerHTML = '';
  emotions.forEach(emotion => {
    const btn = document.createElement('button');
    btn.className = 'mood-btn';
    btn.innerHTML = `
      <span class="emoji">${emotion.emoji}</span>
      <span class="emotion-name">${emotion.value}</span>
      <span class="emotion-desc">${emotion.desc}</span>
    `;
    btn.addEventListener('click', () => {
      chatInput.value = `我感到很${emotion.value}`;
      quickMoodSelector.classList.add('hidden');
      sendMessage();
    });
    moodGrid.appendChild(btn);
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function addMessage(content, isUser) {
  const message = { content, isUser, timestamp: new Date() };
  messages.push(message);
  renderMessage(message);
  scrollToBottom();
}

function renderMessage(message) {
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${message.isUser ? 'user' : 'ai'}`;

  const content = document.createElement('div');
  content.className = 'bubble-content';
  content.textContent = message.content;

  const time = document.createElement('span');
  time.className = 'message-time';
  time.textContent = formatTime(message.timestamp);

  bubble.appendChild(content);
  bubble.appendChild(time);
  messagesContainer.appendChild(bubble);
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  messagesContainer.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 流式调用 API
async function streamAIResponse(userMessage) {
  const controller = new AbortController();
  
  const systemPrompt = `你是一个专业的心理健康助手，专门帮助用户处理情绪问题、压力和心理健康挑战。
你的特点：温暖、同理心强、不带评判、基于心理学原理（CBT、正念等）提供建议、鼓励用户表达情绪、提供实用的应对策略和放松技巧、在适当时候推荐呼吸练习或正念技巧、使用中文回复，保持自然对话风格。
重要原则：不提供医疗诊断或药物建议、鼓励寻求专业帮助当需要时、保持积极但现实的观点、尊重用户的感受和经历。
回复风格：像一位理解你的朋友，提供支持和实用建议。`;

  const requestBody = {
    model: apiConfig.modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500,
    stream: true
  };

  try {
    const response = await fetch(`${apiConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    // 添加空的 AI 消息
    const emptyMessage = { content: '', isUser: false, timestamp: new Date() };
    messages.push(emptyMessage);
    const messageIndex = messages.length - 1;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              messages[messageIndex].content = fullContent;
              
              // 更新 DOM
              const bubbles = messagesContainer.querySelectorAll('.message-bubble.ai');
              const lastBubble = bubbles[bubbles.length - 1];
              if (lastBubble) {
                const contentDiv = lastBubble.querySelector('.bubble-content');
                if (contentDiv) contentDiv.textContent = fullContent;
              }
              scrollToBottom();
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error('API 调用失败:', error);
    throw error;
  }
}

// 本地回退响应
function generateLocalResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('焦虑') || lowerMessage.includes('担心') || lowerMessage.includes('紧张')) {
    return '我理解焦虑的感觉很不舒服。试着深呼吸，我们一起度过这个时刻。你现在的感受是真实的，也是可以被理解的。';
  } else if (lowerMessage.includes('压力') || lowerMessage.includes('累') || lowerMessage.includes('疲惫')) {
    return '听起来你承受了很大的压力。在现代生活中，这种感觉很常见。你愿意和我分享一下压力的来源吗？';
  } else if (lowerMessage.includes('失眠') || lowerMessage.includes('睡不着') || lowerMessage.includes('睡眠')) {
    return '失眠确实很困扰人。睡眠对我们的身心健康都很重要。你愿意和我聊聊是什么让你难以入睡吗？';
  } else if (lowerMessage.includes('悲伤') || lowerMessage.includes('难过') || lowerMessage.includes('沮丧')) {
    return '我感受到你的悲伤。这种情绪虽然痛苦，但它是人类体验的一部分。你愿意和我分享发生了什么吗？';
  } else if (lowerMessage.includes('愤怒') || lowerMessage.includes('生气') || lowerMessage.includes('烦躁')) {
    return '愤怒是一种正常的情绪，它告诉我们某些事情需要被关注。你愿意和我分享是什么让你感到愤怒吗？';
  } else if (lowerMessage.includes('孤独') || lowerMessage.includes('孤单') || lowerMessage.includes('寂寞')) {
    return '孤独感是人类共同的体验，但这并不意味着你必须独自面对它。我在这里陪伴你，倾听你的感受。';
  } else if (lowerMessage.includes('你好') || lowerMessage.includes('嗨') || lowerMessage.includes('hello')) {
    return '你好！很高兴和你聊天。我是专门设计来帮助你处理情绪和压力的智能助手。你今天过得怎么样？';
  } else if (lowerMessage.includes('谢谢')) {
    return '不用谢！能帮助你我感到很开心。记住，照顾好自己的心理健康很重要。';
  } else if (lowerMessage.includes('呼吸') || lowerMessage.includes('放松')) {
    return '呼吸练习是很好的放松方法！你可以尝试我们的呼吸练习功能，或者我可以在这里引导你进行简单的深呼吸。';
  } else if (lowerMessage.includes('冥想') || lowerMessage.includes('正念')) {
    return '正念练习对心理健康非常有益！它帮助我们活在当下，减少对过去和未来的担忧。';
  } else {
    return '谢谢你和我分享。我在这里倾听你，支持你的心理健康之旅。你愿意告诉我更多吗？';
  }
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isTyping) return;

  addMessage(text, true);
  chatInput.value = '';
  updateClearButton();

  isTyping = true;
  showTypingIndicator();

  try {
    // 尝试调用 API
    await streamAIResponse(text);
  } catch (error) {
    // API 失败，使用本地回退
    console.log('API 调用失败，使用本地响应:', error);
    hideTypingIndicator();
    
    // 移除空的 AI 消息
    messages.pop();
    
    // 添加本地响应
    const localResponse = generateLocalResponse(text);
    addMessage(localResponse, false);
  } finally {
    isTyping = false;
    hideTypingIndicator();
    updateClearButton();
  }
}

function updateClearButton() {
  if (messages.length > 1) {
    clearChatBtn.classList.remove('hidden');
  } else {
    clearChatBtn.classList.add('hidden');
  }
}

function clearChat() {
  if (confirm('确定要清空所有聊天记录吗？')) {
    messages = [];
    messagesContainer.innerHTML = '';
    setTimeout(() => {
      addMessage('聊天记录已清空。我是你的心理健康助手，有什么想聊的吗？', false);
      updateClearButton();
    }, 500);
  }
}

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

moodTriggerBtn.addEventListener('click', () => {
  quickMoodSelector.classList.toggle('hidden');
});

moodCancelBtn.addEventListener('click', () => {
  quickMoodSelector.classList.add('hidden');
});

clearChatBtn.addEventListener('click', clearChat);

renderMoodButtons();

setTimeout(() => {
  const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  addMessage(welcomeMsg, false);
}, 1000);

// ==================== 聊天页粒子背景 ====================
const chatDustCanvas = document.getElementById('chatDustCanvas');
const chatRingCanvas = document.getElementById('chatRingCanvas');
let chatParticles = null;
let chatParticleSize = 0;

function generateChatParticles(size) {
  const center = size / 2;
  const baseRadius = size * (130 / 350);
  const particles = [];

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * size,
      y: Math.random() * size,
      size: 1 + Math.random() * 1,
      opacity: 0.1 + Math.random() * 0.4,
      type: 'dust'
    });
  }

  for (let i = 0; i < 600; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = baseRadius * 0.9 + Math.random() * baseRadius * 0.2;
    particles.push({
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      size: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.5,
      type: 'ring'
    });
  }

  for (let i = 0; i < 300; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = baseRadius * 0.8 + Math.random() * baseRadius * 0.08;
    particles.push({
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      size: 0.5 + Math.random() * 1,
      opacity: 0.1 + Math.random() * 0.3,
      type: 'ring'
    });
  }

  for (let i = 0; i < 300; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = baseRadius * 1.12 + Math.random() * baseRadius * 0.08;
    particles.push({
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      size: 0.5 + Math.random() * 1,
      opacity: 0.1 + Math.random() * 0.3,
      type: 'ring'
    });
  }

  return particles;
}

function renderChatRing() {
  if (!chatDustCanvas || !chatRingCanvas) return;

  const dustCtx = chatDustCanvas.getContext('2d');
  const ringCtx = chatRingCanvas.getContext('2d');
  if (!dustCtx || !ringCtx) return;

  const size = 350;
  if (size !== chatParticleSize) {
    chatParticles = generateChatParticles(size);
    chatParticleSize = size;
  }

  const dpr = window.devicePixelRatio || 1;

  chatDustCanvas.width = Math.floor(size * dpr);
  chatDustCanvas.height = Math.floor(size * dpr);
  chatDustCanvas.style.width = `${size}px`;
  chatDustCanvas.style.height = `${size}px`;

  chatRingCanvas.width = Math.floor(size * dpr);
  chatRingCanvas.height = Math.floor(size * dpr);
  chatRingCanvas.style.width = `${size}px`;
  chatRingCanvas.style.height = `${size}px`;

  dustCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dustCtx.clearRect(0, 0, size, size);

  ringCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ringCtx.clearRect(0, 0, size, size);

  if (!chatParticles) return;

  const teal = '42, 157, 143';

  chatParticles.forEach((particle) => {
    const ctx = particle.type === 'dust' ? dustCtx : ringCtx;
    ctx.fillStyle = `rgba(${teal}, ${particle.opacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}
