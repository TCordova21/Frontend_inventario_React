import { useState, useEffect, useMemo } from 'react'
import { X, Package, PackageCheck, Settings, ArrowRightLeft, RotateCcw, Palette, ImageIcon } from 'lucide-react'
import { createMovimiento } from '../../api/movimiento.api'
import { getDisenosFlaten } from '../../api/nodo.api'
import type { Inventario, Sucursal } from '../../types/inventario.types'
import type { CreateMovimientoDto } from '../../types/movimiento.types'
import { toast } from 'react-toastify'
import { getImageUrl } from '../../utils/image'


interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  inventario: Inventario | null
  disenoId: number
  disenoNombre: string
  sucursalId: number
  sucursalNombre: string
  sucursales: Sucursal[]
  disenoNodoId: number 
  viewMode: 'MATRIZ' | 'LOCALES'
}

// Eliminamos DEVOLUCION del tipo
type ModoMovimiento = 'ENTRADA' | 'AJUSTE' | 'TRASLADO' | 'RETORNO_MATRIZ'

const estilosModo: Record<ModoMovimiento, { tab: string; btn: string }> = {
  ENTRADA: { tab: 'bg-purple-100 text-purple-700 border-purple-200', btn: 'bg-purple-600 hover:bg-purple-700' },
  AJUSTE: { tab: 'bg-amber-100 text-amber-700 border-amber-200', btn: 'bg-amber-600 hover:bg-amber-700' },
  TRASLADO: { tab: 'bg-blue-100 text-blue-700 border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700' },
  RETORNO_MATRIZ: { tab: 'bg-rose-100 text-rose-700 border-rose-200', btn: 'bg-rose-600 hover:bg-rose-700' },
}

const StockModal = ({ 
  isOpen, onClose, onSuccess, inventario, disenoId, disenoNombre, 
  sucursalId, sucursalNombre, sucursales, disenoNodoId
}: Props) => {
  const [modo, setModo] = useState<ModoMovimiento>('ENTRADA')
  const [valorInput, setValorInput] = useState('')
  const [sucursalDestinoId, setSucursalDestinoId] = useState<string>('')
  const [selectedDisenoId, setSelectedDisenoId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disenosHijos, setDisenosHijos] = useState<any[]>([])

  const stockActual = inventario?.cantidad || 0

  const disenoSeleccionadoData = useMemo(() => {
    return disenosHijos.find(d => String(d.id) === selectedDisenoId)
  }, [selectedDisenoId, disenosHijos])
  
  const esMatrizActual = useMemo(() => {
    return sucursales.find(s => s.id === sucursalId)?.tipo?.toLowerCase() === 'matriz'
  }, [sucursalId, sucursales])

  // Modos disponibles: Se elimina DEVOLUCION de la vista de locales
  const modosDisponibles = useMemo(() => {
    return esMatrizActual
      ? (['ENTRADA', 'TRASLADO', 'AJUSTE'] as ModoMovimiento[])
      : (['TRASLADO', 'RETORNO_MATRIZ'] as ModoMovimiento[])
  }, [esMatrizActual])

  // Filtro estricto de destinos
  const destinosFiltrados = useMemo(() => {
    if (modo === 'RETORNO_MATRIZ') {
      // Solo matrices (que no sean la actual)
      return sucursales.filter(s => s.tipo?.toLowerCase() === 'matriz' && s.id !== sucursalId && s.activo)
    }
    if (modo === 'TRASLADO') {
      // Solo locales (los traslados a matriz ahora son RETORNO_MATRIZ)
      return sucursales.filter(s => s.tipo?.toLowerCase() === 'local' && s.id !== sucursalId && s.activo)
    }
    return []
  }, [sucursales, sucursalId, modo])

  useEffect(() => {
    const fetchDisenos = async () => {
      if (isOpen && disenoNodoId) {
        try {
          const data = await getDisenosFlaten(disenoNodoId)
          setDisenosHijos(data)
        } catch (err) {
          console.error("Error al obtener diseños:", err)
        }
      }
    }
    fetchDisenos()
  }, [isOpen, disenoNodoId])

  useEffect(() => {
    if (!isOpen) return
    setModo(modosDisponibles[0])
    setValorInput('')
    setSucursalDestinoId('')
    setSelectedDisenoId('')
    setError(null)
  }, [isOpen, modosDisponibles])

  // Autoselección de destino si solo hay uno disponible (común en retornos)
  useEffect(() => {
    if ((modo === 'RETORNO_MATRIZ' || modo === 'TRASLADO') && destinosFiltrados.length > 0) {
      if (!sucursalDestinoId) setSucursalDestinoId(String(destinosFiltrados[0].id));
    }
  }, [modo, destinosFiltrados, sucursalDestinoId]);

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- OBTENCIÓN DEL USUARIO ---
    // Ajusta 'user' por el nombre de la clave que uses en tu app
    const userStr = localStorage.getItem('usuario');
    const user = userStr ? JSON.parse(userStr) : null;
    const usuarioId = user?.id;

    if (!usuarioId) {
      setError('No se pudo identificar al usuario. Por favor, re-inicia sesión.');
      toast.error('No se pudo identificar al usuario. Por favor, re-inicia sesión.')
      return;
    }

    if (modo === 'RETORNO_MATRIZ' && !selectedDisenoId) {
      setError('Selecciona el diseño específico para el retorno');
      return;
    }

    const movimientoPayload: CreateMovimientoDto = {
      diseno_id: modo === 'RETORNO_MATRIZ' ? Number(selectedDisenoId) : (disenoId || null),
      nodo_id: Number(disenoNodoId),
      sucursal_origen_id: Number(sucursalId),
      sucursal_destino_id: (modo === 'TRASLADO' || modo === 'RETORNO_MATRIZ') 
        ? Number(sucursalDestinoId) 
        : (modo === 'ENTRADA' ? Number(sucursalId) : undefined),
      tipo_movimiento: modo,
      cantidad: Number(valorInput),
      referencia: modo === 'RETORNO_MATRIZ' ? `Retorno: ${disenoNombre}` : `Gestión Stock`,
      usuario_id: Number(usuarioId)
    };

    try {
      setSaving(true);
      await createMovimiento(movimientoPayload);
      onSuccess();
      onClose();
       toast.success('Movimiento creado correctamente')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-130 mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Gestionar Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Punto: <span className="font-medium text-blue-600 uppercase">{sucursalNombre}</span> | 
          Categoría: <span className="font-medium text-gray-600">{disenoNombre}</span>
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {modosDisponibles.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setModo(m); setValorInput(m === 'AJUSTE' ? String(stockActual) : ''); setSucursalDestinoId(''); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                modo === m ? estilosModo[m].tab : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {m === 'ENTRADA' && <PackageCheck size={14} />}
              {m === 'AJUSTE' && <Settings size={14} />}
              {m === 'TRASLADO' && <ArrowRightLeft size={14} />}
              {m === 'RETORNO_MATRIZ' && <RotateCcw size={14} />}
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {modo === 'RETORNO_MATRIZ' && (
            <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1">
              <label className="text-sm font-medium text-gray-700">Diseño específico para retorno <span className="text-red-500">*</span></label>
              
              <div className="flex gap-3 items-start">
                <div className="relative flex-1">
                  <select
                    value={selectedDisenoId}
                    onChange={(e) => setSelectedDisenoId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Selecciona el diseño exacto...</option>
                    {disenosHijos.map((n: any) => (
                      <option key={n.id} value={n.id}>{n.nombre} {n.codigo ? `— ${n.codigo}` : ''}</option>
                    ))}
                  </select>
                  <Palette size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>

                <div className="w-40 h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 shadow-sm">
                  {disenoSeleccionadoData?.imagen ? (
                    <img src={getImageUrl(disenoSeleccionadoData.imagen)} alt="Ref" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-300" size={18} />
                  )}
                </div>
              </div>

              {disenoSeleccionadoData && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-md border border-blue-100 animate-in zoom-in-95 duration-200">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                   <p className="text-[11px] font-medium text-blue-700 truncate">
                     Confirmado: {disenoSeleccionadoData.nombre} {disenoSeleccionadoData.codigo && `(${disenoSeleccionadoData.codigo})`}
                   </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Package size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Stock actual en {esMatrizActual ? 'punto' : 'sucursal'}</p>
              <p className="text-sm font-semibold text-gray-800">{stockActual} unidades</p>
            </div>
          </div>

          {(modo === 'TRASLADO' || modo === 'RETORNO_MATRIZ') && (
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
              <label className="text-sm font-medium text-gray-700">
                {modo === 'RETORNO_MATRIZ' ? 'Matriz de Destino' : 'Sucursal Destino (Local)'} <span className="text-red-500">*</span>
              </label>
              <select
                value={sucursalDestinoId}
                onChange={(e) => setSucursalDestinoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecciona destino</option>
                {destinosFiltrados.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} {s.tipo ? `(${s.tipo.toUpperCase()})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {modo === 'AJUSTE' ? 'Nueva cantidad total' : 'Cantidad a mover'} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={valorInput}
              onChange={(e) => { setValorInput(e.target.value); setError(null) }}
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 10"
              required
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 text-sm text-white rounded-lg shadow-sm disabled:opacity-50 transition-all ${estilosModo[modo].btn}`}
            >
              {saving ? 'Procesando...' : `Confirmar ${modo.toLowerCase().replace('_', ' ')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockModal