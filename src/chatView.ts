// src/chatView.ts
import * as vscode from 'vscode';
import { OpenRouterProvider } from './openRouterProvider';
import { OpenRouterModels } from './models/openRouterModels';

export class ChatView {
  public static currentPanel: ChatView | undefined;
  public static readonly viewType = 'qcodeChatView';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _aiProvider: OpenRouterProvider;
  private _models: OpenRouterModels;

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Beside;

    if (ChatView.currentPanel) {
      ChatView.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      ChatView.viewType,
      'QCode Chat',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri]
      }
    );

    ChatView.currentPanel = new ChatView(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._aiProvider = new OpenRouterProvider();
    this._models = new OpenRouterModels();

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'sendMessage':
            await this._handleSendMessage(message.text, message.model);
            break;
          case 'setApiKey':
            await this._handleSetApiKey(message.apiKey);
            break;
          case 'loadModels':
            await this._handleLoadModels();
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    ChatView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) disposable.dispose();
    }
  }

  private async _update() {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private async _handleSendMessage(text: string, model: string) {
    try {
      this._panel.webview.postMessage({ command: 'addMessage', role: 'user', content: text });
      this._panel.webview.postMessage({ command: 'showLoading' });

      const apiKey = this._aiProvider.getApiKey();
      if (!apiKey) {
        this._panel.webview.postMessage({
          command: 'showError',
          content: 'Please set your OpenRouter API key in Settings.'
        });
        this._panel.webview.postMessage({ command: 'hideLoading' });
        return;
      }

      const response = await this._aiProvider.sendMessage(text, model);
      this._panel.webview.postMessage({ command: 'hideLoading' });
      this._panel.webview.postMessage({
        command: 'addMessage',
        role: 'assistant',
        content: response,
        model: model
      });
    } catch (error: any) {
      this._panel.webview.postMessage({ command: 'hideLoading' });
      this._panel.webview.postMessage({
        command: 'showError',
        content: `Error: ${error.message || 'Unknown error'}`
      });
    }
  }

  private async _handleSetApiKey(apiKey: string) {
    await this._aiProvider.setApiKey(apiKey);
    this._panel.webview.postMessage({ command: 'apiKeySaved' });
  }

  private async _handleLoadModels() {
    try {
      const models = await this._models.getFreeModels();
      this._panel.webview.postMessage({ command: 'modelsLoaded', models });
    } catch (error: any) {
      this._panel.webview.postMessage({
        command: 'showError',
        content: `Failed to load models: ${error.message}`
      });
    }
  }

  private _getHtmlForWebview(): string {
    const scriptUri = this._panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );
    const styleUri = this._panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.css')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>QCode Chat</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="model-selector">
        <label for="modelSelect">Model:</label>
        <select id="modelSelect"></select>
        <button class="refresh-btn" id="refreshModelsBtn" title="Refresh Models">🔄</button>
      </div>
      <button class="settings-btn" id="settingsBtn">⚙️ Settings</button>
    </div>
    <div class="chat-container" id="chatContainer">
      <div class="message assistant">
        <div class="welcome-message">
          <h3>👋 Welcome to QCode Chat!</h3>
          <p>Ask me anything about programming. I'm powered by OpenRouter.</p>
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
        <input type="password" id="apiKeyInput" placeholder="Enter your API key">
        <p style="font-size:12px; color:var(--vscode-descriptionForeground);">
          Get your key at <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a>
        </p>
      </div>
      <button id="saveApiKeyBtn">Save API Key</button>
    </div>
  </div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}