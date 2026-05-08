import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import { login } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import Logotipo from '../assets/Logotipo.png'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

const handleSubmit = async (e: React.FormEvent) => {
  // 1. Bloqueo inmediato de la acción por defecto del navegador
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!form.email.trim() || !form.password.trim()) {
    setError('Por favor, ingresa tus credenciales');
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    // 2. Intentamos la petición
    const response = await login(form);
    
    // 3. Si tiene éxito, procedemos (esto solo corre si el status es 2xx)
    const { access_token, refresh_token, usuario } = response;
    setAuth(access_token, refresh_token, usuario);
    
    toast.success("Bienvenido a Elitex");
    navigate('/dashboard');

  } catch (err: any) {
    // 4. MANEJO SEGURO DEL ERROR
    // Esto evita que la página se refresque si el backend falla
    console.error("Detalle del error:", err);

    let mensajeAMostrar = 'Credenciales incorrectas';

    // Verificamos si hay respuesta del servidor (NestJS/Axios)
    if (err?.response?.data) {
      const msg = err.response.data.message;
      mensajeAMostrar = Array.isArray(msg) ? msg[0] : msg || mensajeAMostrar;
    } else if (err?.message === "Network Error") {
      mensajeAMostrar = 'No se pudo conectar con el servidor';
    }

    setError(mensajeAMostrar);
    // IMPORTANTE: Al terminar aquí, el estado 'form' sigue intacto.
    
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-100">
        
        {/* Card de Login */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8">

          {/* Logo Container */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-35 h-35 bg-white rounded-2xl flex items-center justify-center mb-4">
              <img src={Logotipo} alt="Logo Elitex" className="w-full h-full object-contain" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={form.email}
                  // Al escribir, solo quitamos el error visual, mantenemos el valor
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(null) }}
                  placeholder="ejemplo@elitex.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/30"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(null) }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>

        {/* Footer del Login */}
        <p className="text-center text-gray-400 text-xs mt-8">
          &copy; {new Date().getFullYear()} Elitex.
        </p>
      </div>
    </div>
  )
}

export default Login