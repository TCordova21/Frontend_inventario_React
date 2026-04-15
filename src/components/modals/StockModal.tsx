import { useState, useEffect, useMemo } from 'react'
import { X, Package, PackageCheck, Settings, ArrowRightLeft, RefreshCcw } from 'lucide-react'
import { upsertInventario } from '../../api/inventario.api'
import { createMovimiento } from '../../api/movimiento.api'
import type { Inventario, Sucursal } from '../../types/inventario.types'

const MATRIZ_ID = 1

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
}

type ModoMovimiento = 'ENTRADA' | 'AJUSTE' | 'TRASLADO' | 'DEVOLUCION'

// Definimos los estilos de forma explícita para evitar errores de renderizado
const estilosModo: Record<ModoMovimiento, { tab: string; btn: string }> = {
  ENTRADA: { 
    tab: 'bg-purple-100 text-purple-700 border-purple-200', 
    btn: 'bg-purple-600 hover:bg-purple-700' 
  },
  AJUSTE: { 
    tab: 'bg-amber-100 text-amber-700 border-amber-200', 
    btn: 'bg-amber-600 hover:bg-amber-700' 
  },
  TRASLADO: { 
    tab: 'bg-blue-100 text-blue-700 border-blue-200', 
    btn: 'bg-blue-600 hover:bg-blue-700' 
  },
  DEVOLUCION: { 
    tab: 'bg-red-100 text-red-700 border-red-200', 
    btn: 'bg-red-600 hover:bg-red-700' 
  },
}

const StockModal = ({ isOpen, onClose, onSuccess, inventario, disenoId, disenoNombre, sucursalId, sucursalNombre, sucursales }: Props) => {
  const [modo, setModo] = useState<ModoMovimiento>('ENTRADA')
  const [valorInput, setValorInput] = useState('')
  const [stockMinimo, setStockMinimo] = useState('')
  const [sucursalDestinoId, setSucursalDestinoId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stockActual = inventario?.cantidad || 0

  const modosDisponibles = useMemo(() => {
    return sucursalId === MATRIZ_ID 
      ? (['ENTRADA', 'TRASLADO', 'AJUSTE'] as ModoMovimiento[])
      : (['TRASLADO', 'DEVOLUCION'] as ModoMovimiento[])
  }, [sucursalId])

  useEffect(() => {
    if (!isOpen) return
    setModo(modosDisponibles[0])
    setValorInput('')
    setStockMinimo(inventario ? String(inventario.stock_minimo) : '0')
    setSucursalDestinoId('')
    setError(null)
  }, [isOpen, inventario, modosDisponibles])

  if (!isOpen) return null

  const stockFinal = modo === 'ENTRADA' 
    ? stockActual + Number(valorInput || 0) 
    : modo === 'AJUSTE' ? Number(valorInput || 0) : stockActual

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numInput = Number(valorInput)
    
    if (valorInput === '' || (numInput <= 0 && modo !== 'AJUSTE')) return setError('Ingresa una cantidad válida')
    if (modo === 'TRASLADO' && !sucursalDestinoId) return setError('Selecciona una sucursal destino')
    if ((modo === 'TRASLADO' || modo === 'DEVOLUCION') && numInput > stockActual) {
        return setError('No hay suficiente stock para este movimiento')
    }

    try {
      setSaving(true)
      await createMovimiento({
        diseno_id: disenoId,
        sucursal_origen_id: sucursalId,
        sucursal_destino_id: modo === 'TRASLADO' ? Number(sucursalDestinoId) : undefined,
        tipo_movimiento: modo,
        cantidad: numInput,
        referencia: `${modo} desde Inventario`,
        observacion: `Operación realizada en ${sucursalNombre}.`
      })

      if (sucursalId === MATRIZ_ID && Number(stockMinimo) !== inventario?.stock_minimo) {
        await upsertInventario({
          diseno_id: disenoId,
          sucursal_id: MATRIZ_ID,
          cantidad: modo === 'TRASLADO' ? stockActual - numInput : stockFinal,
          stock_minimo: Number(stockMinimo)
        })
      }

      onSuccess()
      onClose()
    } catch {
      setError('Error al procesar la operación')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Gestionar Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Punto: <span className="font-medium text-blue-600 uppercase">{sucursalNombre}</span> | 
          Diseño: <span className="font-medium text-gray-600">{disenoNombre}</span>
        </p>

        {/* Selector de Modo */}
        <div className="flex flex-wrap gap-2 mb-6">
          {modosDisponibles.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setModo(m); setValorInput(m === 'AJUSTE' ? String(stockActual) : ''); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                modo === m ? estilosModo[m].tab : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {m === 'ENTRADA' && <PackageCheck size={14} />}
              {m === 'AJUSTE' && <Settings size={14} />}
              {m === 'TRASLADO' && <ArrowRightLeft size={14} />}
              {m === 'DEVOLUCION' && <RefreshCcw size={14} />}
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Package size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Stock actual en sucursal</p>
              <p className="text-sm font-semibold text-gray-800">{stockActual} unidades</p>
            </div>
          </div>

          {modo === 'TRASLADO' && (
            <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
              <label className="text-sm font-medium text-gray-700">Sucursal Destino <span className="text-red-500">*</span></label>
              <select
                value={sucursalDestinoId}
                onChange={(e) => setSucursalDestinoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecciona destino</option>
                {sucursales.filter(s => s.id !== sucursalId && s.activo).map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
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
              placeholder="0"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {(modo === 'ENTRADA' || modo === 'AJUSTE') && sucursalId === MATRIZ_ID && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-600 font-medium">Stock resultante en Matriz:</span>
                <span className="text-blue-700 font-bold text-sm">{stockFinal} unidades</span>
              </div>
            </div>
          )}

          {sucursalId === MATRIZ_ID && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Alerta de stock mínimo</label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 transition-colors ${
                estilosModo[modo].btn
              }`}
            >
              {saving ? 'Procesando...' : `Confirmar ${modo.toLowerCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockModal