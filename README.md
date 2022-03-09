# React Todo App (TypeScript Version)

Simple React Todo Application

## Reference Documentation
1. [Jest Documentation](https://jestjs.io/docs/getting-started)
2. [Testing Library Documentation](https://testing-library.com/docs/)
3. [How to fetch data with React Hooks](https://www.robinwieruch.de/react-hooks-fetch-data/)
4. [Typesafe JSON parsing](https://www.pluralsight.com/tech-blog/taming-dynamic-data-in-typescript/)

## Testing
### jsdom
In order to jsdom to works, se need to mock the `matchMedia`. Need to add script on `setupTests.js`
```javascript
Object.defineProperty(window, 'matchMedia', {
  value: () => {
    return {
      matches: false,
      addListener: () => { },
      removeListener: () => { }
    };
  }
});
```

### Ant Design
Add below to `package.json` tp ensure the antd can works with testing.
```json
{
  "jest": {
    "transformIgnorePatterns": [
      "/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime).+(js|jsx)$"
    ],
  }
}
```

### Mock
Add below to `package.json` to ensure the test Jest mock / `jest.fn()` can works

```json
{
  "jest": {
    "resetMocks": false
  }
}
```

Ref: https://github.com/facebook/jest/issues/9131

## TypeScript Conversion

Install dependencies
```
npm install --save typescript @types/node @types/react @types/react-dom @types/jest
```

Add `tsconfig.json` on the project root directory
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

References:
- https://create-react-app.dev/docs/adding-typescript/
- https://react-typescript-cheatsheet.netlify.app/docs/basic/setup