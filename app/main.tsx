import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>TanCMS</h1>
      <p>Welcome to your modern Content Management System!</p>
      <p>Built with React, TypeScript, Prisma, and SQLite.</p>
    </div>
  )
}

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)
root.render(<App />)
