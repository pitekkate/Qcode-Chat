import * as vscode from 'vscode';
import { ChatView } from './chatView';

export function activate(context: vscode.ExtensionContext) {
    console.log('QCode Chat extension is now active!');

    let disposable = vscode.commands.registerCommand('qcode-chat.openChat', () => {
        ChatView.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
