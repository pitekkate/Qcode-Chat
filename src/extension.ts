import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    console.log('QCode Chat extension is now active!');

    let disposable = vscode.commands.registerCommand('qcode-chat.helloWorld', async () => {
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel(
            'qcodeChat',
            'QCode Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'sendMessage':
                        await handleSendMessage(message.text, panel);
                        return;
                    case 'setApiKey':
                        await handleSetApiKey(message.apiKey);
                        panel.webview.postMessage({ command: 'apiKeySaved' });
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

async function handleSendMessage(text: string, panel: vscode.WebviewPanel) {
    try {
        // Add user message
        panel.webview.postMessage({
            command: 'addMessage',
            role: 'user',
            content: text
        });

        // Show loading
        panel.webview.postMessage({ command: 'showLoading' });

        // Get API key from config
        const config = vscode.workspace.getConfiguration('qcode-chat');
        const apiKey = config.get('apiKey', '');

        if (!apiKey) {
            panel.webview.postMessage({
                command: 'showError',
                content: 'Please set your OpenRouter API key in VS Code settings'
            });
            panel.webview.postMessage({ command: 'hideLoading' });
            return;
        }

        // Call OpenRouter API
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful coding assistant.' },
                { role: 'user', content: text }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://qcode.dev',
                'X-Title': 'QCode Chat'
            }
        });

        const aiResponse = response.data.choices[0]?.message?.content?.trim() || 'No response';

        // Hide loading and show response
        panel.webview.postMessage({ command: 'hideLoading' });
        panel.webview.postMessage({
            command: 'addMessage',
            role: 'assistant',
            content: aiResponse
        });

    } catch (error: any) {
        panel.webview.postMessage({ command: 'hideLoading' });
        panel.webview.postMessage({
            command: 'showError',
            content: `Error: ${error.message || 'Unknown error'}`
        });
    }
}

async function handleSetApiKey(apiKey: string) {
    const config = vscode.workspace.getConfiguration('qcode-chat');
    await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
}

function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QCode Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        
        .header {
            padding: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-sideBar-background);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 12px;
            line-height: 1.5;
            word-wrap: break-word;
        }
        
        .message.user {
            align-self: flex-end;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-bottom-right-radius: 4px;
        }
        
        .message.assistant {
            align-self: flex-start;
            background-color: var(--vscode-editorWidget-background);
            border-bottom-left-radius: 4px;
        }
        
        .loading {
            align-self: flex-start;
            background-color: var(--vscode-editorWidget-background);
            font-style: italic;
            opacity: 0.8;
        }
        
        .input-container {
            display: flex;
            padding: 15px;
            gap: 10px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-sideBar-background);
        }
        
        #messageInput {
            flex: 1;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 10px 14px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
            min-height: 20px;
            max-height: 150px;
        }
        
        #messageInput:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
        
        #sendBtn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            align-self: flex-end;
            height: 40px;
        }
        
        #sendBtn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        #sendBtn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .settings-btn {
            background: none;
            border: 1px solid var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        
        .settings-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .settings-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .settings-modal.active {
            display: flex;
        }
        
        .settings-content {
            background-color: var(--vscode-editor-background);
            padding: 25px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: 1px solid var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .close-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .settings-content h2 {
            margin-top: 0;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        #apiKeyInput {
            width: 100%;
            padding: 10px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-family: inherit;
            font-size: 14px;
        }
        
        #saveApiKeyBtn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
        }
        
        #saveApiKeyBtn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .error {
            color: #f48771;
            background-color: rgba(244, 135, 113, 0.1);
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #f48771;
        }
        
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-editorGroup-border);
            border-radius: 6px;
            padding: 15px;
            overflow-x: auto;
            margin: 10px 0;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
            line-height: 1.4;
        }
        
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
        }
        
        .welcome-message {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>QCode Chat</h2>
            <button class="settings-btn" id="settingsBtn">⚙️ Settings</button>
        </div>
        
        <div class="chat-container" id="chatContainer">
            <div class="message assistant">
                <div class="welcome-message">
                    <h3>👋 Welcome to QCode Chat!</h3>
                    <p>I'm your AI coding assistant. Ask me anything about programming!</p>
                    <p><small>Tip: Set your OpenRouter API key in Settings to get started.</small></p>
                </div>
            </div>
        </div>
        
        <div class="input-container">
            <textarea id="messageInput" placeholder="Type your coding question... (Press Enter to send)"></textarea>
            <button id="sendBtn">Send</button>
        </div>
    </div>
    
    <div class="settings-modal" id="settingsModal">
        <div class="settings-content">
            <button class="close-btn" id="closeSettingsBtn">✕</button>
            <h2>Settings</h2>
            <div class="form-group">
                <label for="apiKeyInput">OpenRouter API Key:</label>
                <input type="password" id="apiKeyInput" placeholder="Enter your OpenRouter API key">
                <p style="font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 5px;">
                    Get your API key from <a href="https://openrouter.ai/keys" target="_blank" style="color: var(--vscode-textLink-foreground);">openrouter.ai</a>
                </p>
            </div>
            <button id="saveApiKeyBtn">Save API Key</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

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

        function sendMessage() {
            const text = messageInput.value.trim();
            if (text && !isLoading) {
                vscode.postMessage({ command: 'sendMessage', text: text });
                messageInput.value = '';
                messageInput.style.height = 'auto';
            }
        }

        function addMessage(role, content) {
            // Remove welcome message if it exists
            const welcomeMessage = chatContainer.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.parentElement.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            
            // Simple parsing for code blocks and inline code
            let parsedContent = content
                .replace(/&/g, '&amp;')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/\\\`\\\`\\\`(\\\w+)?\\\n([\\\\s\\\\S]*?)\\\`\\\`\\\`/g, '<pre><code>$2</code></pre>')
                .replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>')
                .replace(/\\n/g, '<br>');
            
            messageDiv.innerHTML = parsedContent;
            chatContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function showLoading() {
            isLoading = true;
            sendBtn.disabled = true;
            
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message loading';
            loadingDiv.id = 'loadingMessage';
            loadingDiv.textContent = 'AI is thinking...';
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

        function scrollToBottom() {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Message handler
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'addMessage':
                    addMessage(message.role, message.content);
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
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}
