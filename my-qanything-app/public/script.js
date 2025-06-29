document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const chatForm = document.getElementById('chatForm');
    const sendButton = document.getElementById('sendButton');

    // 简单生成一个用户ID，实际应用中应有更完善的用户管理
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);

    // 初始欢迎消息
    appendMessage('assistant', '你好！我是你的QAnything智能助手，有什么可以帮助你的吗？');

    function appendMessage(sender, message, sources = []) {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', sender);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = message.replace(/\n/g, '<br>'); // 支持换行
        messageBubble.appendChild(messageContent);

        chatMessages.appendChild(messageBubble);

        if (sources && sources.length > 0) {
            sources.forEach(source => {
                const sourceItem = document.createElement('div');
                sourceItem.classList.add('source-item');
                sourceItem.innerHTML = `<strong>来源:</strong> ${source.file_name} (得分: ${source.score.toFixed(2)})`;
                chatMessages.appendChild(sourceItem);
            });
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const question = userInput.value.trim();
        if (!question) return;

        appendMessage('user', question);
        userInput.value = '';

        const loadingIndicator = document.createElement('div');
        loadingIndicator.classList.add('loading-indicator');
        loadingIndicator.textContent = '助手正在思考...';
        chatMessages.appendChild(loadingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question, userId })
            });

            chatMessages.removeChild(loadingIndicator); // 移除加载提示

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API请求失败');
            }

            const data = await response.json();
            appendMessage('assistant', data.answer, data.source);
        } catch (error) {
            console.error('发送消息失败:', error);
            if (chatMessages.contains(loadingIndicator)) {
                chatMessages.removeChild(loadingIndicator); // 移除加载提示
            }
            appendMessage('assistant', '抱歉，与助手通信时发生错误。请稍后再试。');
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 阻止表单默认提交行为
        sendMessage();
    });

    // 也可以监听按钮点击事件
    sendButton.addEventListener('click', sendMessage);
});