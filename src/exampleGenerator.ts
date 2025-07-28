import * as vscode from 'vscode';

export class ExampleGenerator {
    private static topics = [
        'variables',
        'functions', 
        'loops',
        'conditionals',
        'arrays',
        'objects',
        'strings',
        'numbers',
        'error-handling',
        'file-operations'
    ];

    static async generateExamples() {
        const topic = await vscode.window.showQuickPick(this.topics, {
            placeHolder: 'Select a programming topic'
        });

        if (topic) {
            await this.generateTopicExamples(topic);
        }
    }

    private static async generateTopicExamples(topic: string) {
        const editor = vscode.window.activeTextEditor;
        const language = editor?.document.languageId || 'javascript';

        const prompts = {
            'variables': `Generate beginner-friendly examples for variables in ${language}:

Please provide:
1. Simple explanation of what variables are
2. Different ways to declare variables
3. Variable naming conventions
4. Common mistakes and how to avoid them
5. Practice exercises with solutions

Examples should be:
- Well-commented
- Include expected output
- Suitable for absolute beginners`,
            
            'functions': `Generate beginner-friendly examples for functions in ${language}:

Please provide:
1. What are functions and why use them
2. Function syntax and structure
3. Parameters and return values
4. Different function types
5. Practice exercises with solutions

Examples should be:
- Well-commented
- Include expected output
- Build complexity gradually`,
            
            'loops': `Generate beginner-friendly examples for loops in ${language}:

Please provide:
1. What are loops and when to use them
2. Different loop types (for, while, etc.)
3. Loop control statements (break, continue)
4. Nested loops
5. Practice exercises with solutions

Examples should be:
- Well-commented
- Include expected output
- Show real-world use cases`,
            
            'conditionals': `Generate beginner-friendly examples for conditionals in ${language}:

Please provide:
1. What are conditionals and why use them
2. If-else statements
3. Switch statements
4. Comparison and logical operators
5. Practice exercises with solutions

Examples should be:
- Well-commented
- Include expected output
- Cover common decision-making scenarios`
        };

        const prompt = prompts[topic as keyof typeof prompts] || `Generate beginner-friendly examples for ${topic} in ${language}`;

        // Kirim ke chat view
        this.sendMessageToChat('generateExamples', prompt);
    }

    static async generatePracticeExercises() {
        const topic = await vscode.window.showQuickPick(this.topics, {
            placeHolder: 'Select a topic for practice exercises'
        });

        if (topic) {
            await this.generateExercisesForTopic(topic);
        }
    }

    private static async generateExercisesForTopic(topic: string) {
        const editor = vscode.window.activeTextEditor;
        const language = editor?.document.languageId || 'javascript';

        const prompt = `Generate 5 practice exercises for ${topic} in ${language}:

For each exercise, provide:
1. Problem statement (clear and simple)
2. Sample input/output
3. Hints for solving
4. Complete solution with comments
5. Explanation of the solution

Exercises should be:
- Progressive difficulty
- Well-suited for beginners
- Include real-world scenarios
- Have clear success criteria`;

        this.sendMessageToChat('practiceExercises', prompt);
    }

    private static async sendMessageToChat(action: string, prompt: string) {
        // Placeholder untuk mengirim pesan ke chat view
        console.log(`Sending ${action} request to chat view`);
    }
}
