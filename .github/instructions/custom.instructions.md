---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
This project is a web application focused on voice patches consultation. The main technologies used are HTML, CSS, and JavaScript. When contributing to this project, please adhere to the following guidelines:
1. **Tone of Text**: Any text generated must have a relatable, human like tone, as this website is for speech therapy patients.
2. **HTML Structure**: Ensure that all HTML elements are properly nested and closed. Use semantic HTML5 elements where appropriate.
3. **Accessibility**: Follow best practices for web accessibility, including using ARIA roles and attributes where necessary.
4. **CSS Styling**: Don't carelessly generate CSS rules, see if there is an existing class, rule or ID that can be reused, and any significant changes to the CSS on desktop view should be applied to mobile view the right way. Also ensure that the rules aren't all in one line for readability. SO if you add a new CSS rule, please format it like this:
```selector {
    property: value;
    property: value;
}
```
5. **JavaScript Practices**: Write clean, reusable, and well commented code, do not over use comments and only use them to explain complex logic, and what it does in the website. Avoid using global variables and functions unless absolutely necessary.
6. **Use of Comments**: Use comments only when needed to explain the purpose of code blocks that seems complex, avoid over-commenting. I understand they are helpful but unless in JS for complex logic or to mark sections or parts of code, I don't always require them.