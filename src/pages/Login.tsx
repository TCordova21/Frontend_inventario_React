import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => {
          localStorage.setItem('token', 'test')
          navigate('/dashboard')
        }}
      >
        Iniciar sesión (prueba)
      </button>
    </div>
  )
}

export default Login