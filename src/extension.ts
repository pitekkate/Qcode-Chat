// src/extension.ts
import * as vscode from 'vscode';
import { ChatView } from './chatView';
import { CodeExplainer } from './codeExplainer';
import { ErrorDetector } from './errorDetector';
import { ExampleGenerator } from './exampleGenerator';
import { TutorialManager } from './tutorialManager';

export function activate(context: vscode.ExtensionContext) {
  console.log('QCode Chat extension is now active!');

  const openChat = vscode.commands.registerCommand('qcode-chat.openChat', () => {
    ChatView.createOrShow(context.extensionUri);
  });

  const explainCode = vscode.commands.registerCommand('qcode-chat.explainCode', () => {
    CodeExplainer.explainCode();
  });

  const findBugs = vscode.commands.registerCommand('qcode-chat.findBugs', () => {
    CodeExplainer.findBugs();
  });

  const generateExamples = vscode.commands.registerCommand('qcode-chat.generateExamples', () => {
    ExampleGenerator.generateExamples();
  });

  const generatePractice = vscode.commands.registerCommand('qcode-chat.generatePracticeExercises', () => {
    ExampleGenerator.generatePracticeExercises();
  });

  const tutorialMode = vscode.commands.registerCommand('qcode-chat.tutorialMode', async () => {
    const topic = await vscode.window.showQuickPick(['variables', 'functions'], {
      placeHolder: 'Select a tutorial'
    });
    if (topic) {
      TutorialManager.startTutorial(topic);
    }
  });

  const detectErrors = vscode.commands.registerCommand('qcode-chat.detectErrors', () => {
    ErrorDetector.detectAndFixErrors();
  });

  const explainError = vscode.commands.registerCommand('qcode-chat.explainError', () => {
    ErrorDetector.explainError('');
  });

  context.subscriptions.push(
    openChat,
    explainCode,
    findBugs,
    generateExamples,
    generatePractice,
    tutorialMode,
    detectErrors,
    explainError
  );
}

export function deactivate() {}