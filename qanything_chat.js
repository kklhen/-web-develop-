// JavaScript 逻辑 
const userInput = document.getElementById('user-input'); 
const sendBtn = document.getElementById('send-btn'); 
const chatHistory = document.getElementById('chat-history'); 

// ======================= 关键配置区域 ======================= 
// API 地址。如果 QAnything 和网页都在你的电脑上，这个地址通常不需要改。 
const QANYTHING_API_URL = 'https://openapi.youdao.com/q_anything/api'; 

// 你的知识库 ID (已为你填好) 
const KB_ID = 'KB62eb53f992f244ae9ea582aca7e79cb1_240430'; 

// 每个用户一个ID，这里用一个固定的ID作为示例 
const USER_ID = 'my_webpage_user_01'; 
// ========================================================== 

async function sendMessage() { 
    const question = userInput.value.trim(); 
    if (!question) return; 

    // 1. 在界面上显示用户的问题 
    appendMessage('user', question); 
    userInput.value = ''; 
    
    // 显示一个“正在思考”的提示 
    const thinkingMessage = appendMessage('bot', '...'); 

    try { 
        // 2. 发送请求到 QAnything API 
        const response = await fetch(QANYTHING_API_URL, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'q-anything-api-key': 'bot-w0uitU63Z1kDG3GiNgFsJUXhyLjaGSZZ' // 添加 API 密钥
            },
            body: JSON.stringify({
                user_id: USER_ID,
                kb_id: KB_ID,
                question: question,
                history: [] // 为简化，暂不传递历史记录
            })
        }); 

        if (!response.ok) { 
            throw new Error(`API 请求失败，状态码: ${response.status}`); 
        } 

        const result = await response.json(); 
        
        // 3. 用真实的回答更新“正在思考”的提示 
        thinkingMessage.innerText = result.response; 

    } catch (error) { 
        console.error("与AI通信时发生错误:", error); 
        thinkingMessage.innerText = '抱歉，我好像遇到了一点问题。请检查 QAnything 服务是否正常运行，或稍后再试。'; 
        thinkingMessage.style.backgroundColor = '#FFDDDD'; // 错误提示用红色背景 
    } 
} 

function appendMessage(sender, text) { 
    const messageElement = document.createElement('div'); 
    messageElement.className = `message ${sender}-message`; 
    messageElement.innerText = text; 
    chatHistory.appendChild(messageElement); 
    // 自动滚动到最新消息 
    chatHistory.scrollTop = chatHistory.scrollHeight; 
    return messageElement; // 返回创建的元素，方便后续更新 
} 

// 绑定事件监听 
sendBtn.addEventListener('click', sendMessage); 
userInput.addEventListener('keypress', function(event) { 
    if (event.key === 'Enter') { 
        sendMessage(); 
    } 
});