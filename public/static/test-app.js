// Simple test to verify React is working
console.log('Test app loading...');

if (typeof React === 'undefined') {
  console.error('React is not loaded');
} else {
  console.log('React is available:', React);
}

if (typeof ReactDOM === 'undefined') {
  console.error('ReactDOM is not loaded');
} else {
  console.log('ReactDOM is available:', ReactDOM);
}

const TestApp = () => {
  return React.createElement('div', {
    style: { padding: '20px', textAlign: 'center' }
  }, [
    React.createElement('h1', { key: 'title' }, 'מערכת ניהול בדיקות בריאות'),
    React.createElement('p', { key: 'loading' }, 'מערכת נטענת...')
  ]);
};

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(TestApp));
  }
});