(function () {
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const modelSelect = document.getElementById('modelSelect');
    const refreshModelsBtn = document.getElementById('refreshModelsBtn');

    let isLoading = false;

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', () => {
        // Auto-resize textarea
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
    });

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            vscode.postMessage({ command: 'setApiKey', apiKey: apiKey });
        }
    });

    refreshModelsBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'loadModels' });
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        const model = modelSelect.value;
        if (text && !isLoading) {
            vscode.postMessage({ command: 'sendMessage', text: text, model: model });
            messageInput.value = '';
            messageInput.style.height = 'auto';
        }
    }

    function addMessage(role, content, model = null) {
        // Remove welcome message if it exists
        const welcomeMessage = chatContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.parentElement.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        // Add model tag for assistant messages
        let header = '';
        if (role === 'assistant' && model) {
            const modelName = model.split('/').pop().replace(':free', '');
            header = `<div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
                Assistant <span class="model-tag">${modelName}</span>
            </div>`;
        } else if (role === 'user') {
            header = `<div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">You</div>`;
        }
        
        // Simple parsing for code blocks and inline code
        let parsedContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = header + parsedContent;
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function showLoading() {
        isLoading = true;
        sendBtn.disabled = true;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message loading';
        loadingDiv.id = 'loadingMessage';
        
        const modelName = modelSelect.selectedOptions[0].text.split(' (')[0];
        loadingDiv.innerHTML = `<div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
            Assistant <span class="model-tag">${modelName}</span>
        </div>AI is thinking...`;
        
        chatContainer.appendChild(loadingDiv);
        scrollToBottom();
    }

    function hideLoading() {
        isLoading = false;
        sendBtn.disabled = false;
        
        const loadingDiv = document.getElementById('loadingMessage');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    function showError(content) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = content;
        chatContainer.appendChild(errorDiv);
        scrollToBottom();
    }

    function updateModelSelector(models) {
        const currentValue = modelSelect.value;
        modelSelect.innerHTML = '';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            if (model.id === currentValue) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
        
        // Ensure default model is selected if available
        if (!modelSelect.querySelector('option[value="qwen/qwen3-coder:free"]')) {
            const defaultOption = modelSelect.querySelector('option');
            if (defaultOption) {
                defaultOption.selected = true;
            }
        }
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Message handler
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'addMessage':
                addMessage(message.role, message.content, message.model);
                break;
            case 'showLoading':
                showLoading();
                break;
            case 'hideLoading':
                hideLoading();
                break;
            case 'showError':
                showError(message.content);
                break;
            case 'apiKeySaved':
                settingsModal.classList.remove('active');
                alert('API key saved successfully!');
                break;
            case 'modelsLoaded':
                updateModelSelector(message.models);
                break;
        }
    });

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Set default model
        modelSelect.value = 'qwen/qwen3-coder:free';
        vscode.postMessage({ command: 'loadModels' });
    });
})();
