// src/tutorialManager.ts
import * as vscode from 'vscode';

export class TutorialManager {
  private static tutorials = {
    'variables': {
      id: 'variables',
      title: 'Understanding Variables',
      steps: [
        {
          title: 'What are Variables?',
          content: `Variables are containers that store data in your program. Think of them like labeled boxes where you can put different things.
Example:
\`\`\`javascript
let name = "Budi";
let age = 25;
let isActive = true;
\`\`\`
Each variable stores different types of data:
- Strings (text): "Budi"
- Numbers: 25
- Booleans (true/false): true`
        },
        {
          title: 'Declaring Variables',
          content: `There are three ways to declare variables in JavaScript:
1. **let** - Can be changed later
\`\`\`javascript
let message = "Hello";
message = "Hi"; // This is allowed
\`\`\`
2. **const** - Cannot be changed
\`\`\`javascript
const PI = 3.14;
// PI = 3.15; // This would cause an error
\`\`\`
3. **var** - Old way (avoid using)
\`\`\`javascript
var oldWay = "Don't use this";
\`\`\``
        },
        {
          title: 'Variable Naming Rules',
          content: `Good variable names make your code easier to understand:
✅ **Good Practices:**
- Use descriptive names: \`userName\` instead of \`x\`
- Use camelCase: \`firstName\`, \`totalAmount\`
- Start with letter, $, or _: \`$element\`, \`_private\`
❌ **Bad Practices:**
- Don't use spaces: \`user name\` ❌
- Don't start with numbers: \`1user\` ❌
- Don't use reserved words: \`let\`, \`function\` ❌
Examples:
\`\`\`javascript
// Good
let studentName = "Andi";
let totalScore = 95;
let isLoggedIn = false;
// Bad
let x = "Andi";
let 1score = 95;
let function = true; // Reserved word!
\`\`\``
        },
        {
          title: 'Practice Exercise',
          content: `Let's practice what you've learned!
Exercise 1: Create variables for a student profile
\`\`\`javascript
// Create these variables:
// 1. Student name (string)
// 2. Age (number)
// 3. Grade level (number)
// 4. Is enrolled (boolean)
let studentName = "Budi";
let age = 16;
let gradeLevel = 10;
let isEnrolled = true;
console.log(\`Student: \${studentName}, Age: \${age}\`);
\`\`\`
Exercise 2: Update variable values
\`\`\`javascript
let score = 85;
score = 90; // Updated score
console.log("New score:", score);
\`\`\``
        }
      ]
    },
    'functions': {
      id: 'functions',
      title: 'Understanding Functions',
      steps: [
        {
          title: 'What are Functions?',
          content: `Functions are reusable blocks of code that perform specific tasks. Think of them like recipes - you write them once and use them many times.
Benefits:
- Reduce code repetition
- Make code organized
- Easy to maintain
- Reusable anywhere
Example:
\`\`\`javascript
// Function to greet someone
function greet(name) {
    return "Hello, " + name + "!";
}
// Using the function
console.log(greet("Andi")); // "Hello, Andi!"
console.log(greet("Budi")); // "Hello, Budi!"
\`\`\``
        },
        {
          title: 'Function Syntax',
          content: `Basic function structure:
\`\`\`javascript
function functionName(parameter1, parameter2) {
    // Code to execute
    return result; // Optional
}
\`\`\`
Parts explained:
1. **function** - Keyword to declare a function
2. **functionName** - Descriptive name
3. **parameters** - Inputs the function needs
4. **{return}** - What the function gives back
5. **Calling** - Using the function
Example with explanation:
\`\`\`javascript
function calculateArea(length, width) {
    // Parameters: length and width
    let area = length * width;  // Calculate area
    return area;                 // Return the result
}
let roomArea = calculateArea(10, 8); // Calling function
console.log("Room area:", roomArea); // 80
\`\`\``
        },
        {
          title: 'Different Function Types',
          content: `JavaScript has several ways to create functions:
1. **Regular Function**
\`\`\`javascript
function add(a, b) {
    return a + b;
}
\`\`\`
2. **Arrow Function** (modern syntax)
\`\`\`javascript
const add = (a, b) => {
    return a + b;
};
// Even shorter for single return
const multiply = (a, b) => a * b;
\`\`\`
3. **Anonymous Function**
\`\`\`javascript
const greeting = function(name) {
    return "Hello " + name;
};
\`\`\`
When to use which:
- Regular: Most common, works everywhere
- Arrow: Short functions, callbacks
- Anonymous: One-time use functions`
        },
        {
          title: 'Practice Exercise',
          content: `Let's create some useful functions!
Exercise 1: Create a calculator function
\`\`\`javascript
// Create functions for basic math operations
function add(a, b) {
    return a + b;
}
function subtract(a, b) {
    return a - b;
}
function multiply(a, b) {
    return a * b;
}
function divide(a, b) {
    if (b !== 0) {
        return a / b;
    } else {
        return "Cannot divide by zero!";
    }
}
// Test your functions
console.log("5 + 3 =", add(5, 3));
console.log("10 - 4 =", subtract(10, 4));
console.log("6 * 7 =", multiply(6, 7));
console.log("15 / 3 =", divide(15, 3));
\`\`\`
Exercise 2: Create a utility function
\`\`\`javascript
// Function to check if a number is even
function isEven(number) {
    return number % 2 === 0;
}
console.log(isEven(4)); // true
console.log(isEven(7)); // false
\`\`\``
        }
      ]
    }
  };

  static async startTutorial(tutorialId: string) {
    const tutorial = this.tutorials[tutorialId as keyof typeof this.tutorials];
    if (!tutorial) {
      vscode.window.showErrorMessage('Tutorial not found');
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'tutorialView',
      tutorial.title,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.extensions.getExtension('pitekkate.qcode-chat')!.extensionUri]
      }
    );

    let currentStep = 0;

    panel.webview.html = this.getTutorialHtml(tutorial, currentStep);

    panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'nextStep':
          currentStep = Math.min(currentStep + 1, tutorial.steps.length - 1);
          panel.webview.html = this.getTutorialHtml(tutorial, currentStep);
          break;

        case 'prevStep':
          currentStep = Math.max(currentStep - 1, 0);
          panel.webview.html = this.getTutorialHtml(tutorial, currentStep);
          break;

        case 'completeTutorial':
          panel.dispose();
          vscode.window.showInformationMessage(`🎉 Congratulations! You completed the **${tutorial.title}** tutorial!`);
          break;
      }
    });
  }

  private static getTutorialHtml(tutorial: any, currentStep: number): string {
    const step = tutorial.steps[currentStep];
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      margin: 0;
      padding: 20px;
    }
    .tutorial-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .step-container {
      background-color: var(--vscode-editorWidget-background);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .step-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: var(--vscode-button-background);
    }
    .step-content {
      line-height: 1.6;
    }
    .step-content pre {
      background-color: var(--vscode-textCodeBlock-background);
      border: 1px solid var(--vscode-editorGroup-border);
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      margin: 15px 0;
    }
    .step-content code {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Courier New', monospace;
    }
    .navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    .nav-btn {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .nav-btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .progress {
      text-align: center;
      margin: 20px 0;
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <div class="tutorial-container">
    <div class="header">
      <h1>${tutorial.title}</h1>
      <p>Learn step by step with interactive examples</p>
    </div>
    <div class="progress">Step ${currentStep + 1} of ${tutorial.steps.length}</div>
    <div class="step-container">
      <div class="step-title">${step.title}</div>
      <div class="step-content">${step.content}</div>
    </div>
    <div class="navigation">
      <button class="nav-btn" onclick="vscode.postMessage({command: 'prevStep'})" ${currentStep === 0 ? 'disabled' : ''}>Previous</button>
      <button class="nav-btn" onclick="vscode.postMessage({command: 'nextStep'})">${currentStep === tutorial.steps.length - 1 ? 'Complete' : 'Next'}</button>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
  </script>
</body>
</html>`;
  }
}