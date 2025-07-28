import * as vscode from 'vscode';

export class ErrorDetector {
    static async detectAndFixErrors() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const code = document.getText();
        const language = document.languageId;

        const prompt = `Analyze the following ${language} code for common errors and provide fixes:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. List of potential errors found
2. Explanation in simple terms (for beginners)
3. How to fix each error
4. Prevention tips
5. Best practices to avoid similar errors`;

        // Kirim ke chat view
        this.sendMessageToChat('detectErrors', prompt);
    }

    static async explainError(errorMessage: string) {
        const prompt = `Explain this error message in simple terms for a beginner programmer:

Error: "${errorMessage}"

Please provide:
1. What this error means (simple explanation)
2. Common causes
3. How to fix it
4. Example of correct code
5. Prevention tips`;

        this.sendMessageToChat('explainError', prompt);
    }

    private static async sendMessageToChat(action: string, prompt: string) {
        // Placeholder untuk mengirim pesan ke chat view
        console.log(`Sending ${action} request to chat view`);
    }
}
