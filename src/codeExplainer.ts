import * as vscode from 'vscode';

export class CodeExplainer {
    static async explainCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Please select some code to explain');
            return;
        }

        const selectedText = editor.document.getText(selection);
        const fileName = editor.document.fileName.split(/[/\\]/).pop() || 'unknown';
        const language = editor.document.languageId;

        const prompt = `Please explain the following ${language} code from ${fileName} in simple Indonesian terms for beginners:

\`\`\`${language}
${selectedText}
\`\`\`

Please provide:
1. What this code does (in simple terms)
2. Key concepts used
3. Step-by-step breakdown
4. Common mistakes to avoid
5. Best practices`;

        // Kirim ke chat view
        await this.sendMessageToChat('explainCode', prompt);
    }

    static async findBugs() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Please select some code to check for bugs');
            return;
        }

        const selectedText = editor.document.getText(selection);
        const fileName = editor.document.fileName.split(/[/\\]/).pop() || 'unknown';
        const language = editor.document.languageId;

        const prompt = `Check the following ${language} code from ${fileName} for potential bugs and issues:

\`\`\`${language}
${selectedText}
\`\`\`

Please provide:
1. Potential bugs found
2. Explanation in simple terms
3. How to fix each issue
4. Prevention tips for future`;

        await this.sendMessageToChat('findBugs', prompt);
    }

    static async generateExamples(topic: string) {
        const editor = vscode.window.activeTextEditor;
        const language = editor?.document.languageId || 'javascript';

        const prompt = `Generate beginner-friendly examples for ${topic} in ${language}:

Please provide:
1. Simple explanation
2. Basic example with comments
3. Common variations
4. Best practices
5. Things to avoid`;

        await this.sendMessageToChat('generateExamples', prompt);
    }

    static async tutorialMode(topic: string) {
        const tutorials: { [key: string]: { title: string; content: string } } = {
            'variables': {
                title: 'Understanding Variables',
                content: `Variables are like boxes that store information. Let's learn step by step:

1. **What are variables?**
   - Containers for storing data values
   - Like labeled boxes in your room

2. **How to declare variables:**
   \`\`\`javascript
   let name = "Budi";        // Text variable
   let age = 25;             // Number variable
   let isActive = true;       // Boolean variable
   \`\`\`

3. **Naming rules:**
   - Must begin with letter, $, or _
   - Cannot contain spaces
   - Case-sensitive (myVar ≠ myvar)

4. **Best practices:**
   - Use descriptive names
   - Follow camelCase convention
   - Avoid reserved keywords`
            },
            'functions': {
                title: 'Understanding Functions',
                content: `Functions are reusable blocks of code. Think of them as recipes:

1. **What are functions?**
   - Reusable code blocks
   - Like recipes you can use anytime

2. **Basic syntax:**
   \`\`\`javascript
   function functionName(parameters) {
       // code to execute
       return result;
   }
   
   // Example:
   function greet(name) {
       return "Hello " + name;
   }
   
   greet("Andi"); // Returns "Hello Andi"
   \`\`\`

3. **Types of functions:**
   - Named functions
   - Arrow functions
   - Anonymous functions

4. **Best practices:**
   - Keep functions small and focused
   - Use descriptive names
   - Return meaningful values`
            },
            'loops': {
                title: 'Understanding Loops',
                content: `Loops repeat actions multiple times. Like doing chores repeatedly:

1. **What are loops?**
   - Repeat code execution
   - Save time and effort

2. **Common loop types:**
   \`\`\`javascript
   // For loop
   for (let i = 0; i < 5; i++) {
       console.log("Iteration " + i);
   }
   
   // While loop
   let count = 0;
   while (count < 5) {
       console.log("Count: " + count);
       count++;
   }
   
   // For-of loop (arrays)
   const fruits = ["apple", "banana", "orange"];
   for (const fruit of fruits) {
       console.log(fruit);
   }
   \`\`\`

3. **When to use each:**
   - For: Known number of iterations
   - While: Unknown number of iterations
   - For-of: Iterating arrays/objects

4. **Avoid infinite loops:**
   - Always update loop condition
   - Test with small datasets first`
            }
        };

        const tutorial = tutorials[topic] || tutorials['variables'];
        
        // Tampilkan tutorial di chat
        await this.showTutorialInChat(tutorial);
    }

    private static async sendMessageToChat(action: string, prompt: string) {
        // Kirim pesan ke chat view melalui command
        vscode.commands.executeCommand('qcode-chat.openChat');
        
        // Tunda sebentar untuk memastikan chat view terbuka
        setTimeout(() => {
            // Kirim pesan menggunakan command yang benar
            vscode.commands.executeCommand('qcode-chat.handleMessage', {
                command: 'sendMessageToChat', 
                action: action, 
                prompt: prompt 
            });
        }, 500);
    }

    private static async showTutorialInChat(tutorial: { title: string; content: string }) {
        // Tampilkan tutorial menggunakan notification
        const selection = await vscode.window.showInformationMessage(
            `${tutorial.title}: ${tutorial.content.substring(0, 100)}...`,
            'View Full Tutorial',
            'Close'
        );
        
        if (selection === 'View Full Tutorial') {
            // Buat dokumen baru dengan konten tutorial
            const doc = await vscode.workspace.openTextDocument({
                content: `# ${tutorial.title}\n\n${tutorial.content}`,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        }
    }
}
