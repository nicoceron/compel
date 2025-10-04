# Contributing to Compel

Thank you for your interest in contributing to Compel! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/compel.git
   cd compel
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

Examples:
- `feature/payment-integration`
- `fix/dashboard-loading-state`
- `docs/api-documentation`

### Commit Messages

Follow the conventional commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(goals): add check-in functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

## 🏗️ Code Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type
- Use strict mode

### React Components

- Use functional components with hooks
- Prefer server components when possible
- Use client components only when needed
- Keep components small and focused
- One component per file

### File Structure

```typescript
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui";

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // Component logic
}
```

### Naming Conventions

- **Components**: PascalCase (`GoalCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GOALS`)
- **Types**: PascalCase (`GoalWithCheckIns`)

### Styling

- Use Tailwind CSS utility classes
- Avoid inline styles
- Use the established color palette
- Maintain dark mode support
- Keep responsive design in mind

## 🧪 Testing

### Before Submitting

1. Test your changes locally
2. Check for TypeScript errors:
   ```bash
   npm run build
   ```
3. Run the linter:
   ```bash
   npm run lint
   ```
4. Test in both light and dark mode
5. Test on mobile and desktop

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Dark mode works correctly
- [ ] Forms validate properly
- [ ] Loading states display
- [ ] Error states display

## 📦 Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add JSDoc comments to functions
   - Update CHANGELOG (if applicable)

2. **Create Pull Request**
   - Use a clear title
   - Describe what changed and why
   - Reference any related issues
   - Include screenshots for UI changes

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How was this tested?
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tested on mobile and desktop
   ```

4. **Review Process**
   - Address review comments
   - Keep discussions focused
   - Be open to feedback

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Verify it's reproducible
3. Test in incognito mode
4. Clear cache and try again

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 22]
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Any alternative solutions?

## Additional Context
Any other information
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on the code, not the person
- Assume good intentions

## 📧 Questions?

If you have questions:
- Check existing issues
- Review documentation
- Ask in discussions
- Contact maintainers

## 🎉 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project website (future)

Thank you for contributing to Compel! 🙌

