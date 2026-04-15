import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Página no encontrada</p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => navigate('/')}
      >
        Volver al inicio
      </button>
    </div>
  )
}

export default NotFound