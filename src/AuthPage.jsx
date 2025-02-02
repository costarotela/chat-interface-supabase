import { useState } from 'react'

export default function AuthPage({ supabase }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-dark-blue flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-medium-blue p-8 rounded-lg w-96">
        <h2 className="text-accent-blue text-2xl mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-dark-gray text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 rounded bg-dark-gray text-white"
        />
        <button type="submit" className="w-full bg-accent-blue text-white py-2 rounded hover:bg-blue-400">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
        <p className="text-gray-400 mt-4 text-center cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </p>
      </form>
    </div>
  )
}
