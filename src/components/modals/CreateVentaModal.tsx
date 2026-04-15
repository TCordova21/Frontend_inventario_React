import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { getDisenos } from '../../api/disenos.api'
import { createVenta } from '../../api/venta.api'
import type { Diseno } from '../../types/diseno.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateVentaModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [items, setItems] = useState([
    { diseno_id: 0, cantidad: 1, precio_unitario: 0 }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) getDisenos().then(setDisenos)
  }, [isOpen])

  if (!isOpen) return null

  const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { diseno_id: 0, cantidad: 1, precio_unitario: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      await createVenta({
        detalles: items,
        usuario_id: 1,
        sucursal_id: 1
      })

      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Nueva venta</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">

              <select
                value={item.diseno_id}
                onChange={(e) => updateItem(i, 'diseno_id', Number(e.target.value))}
                className="flex-1 px-2 py-2 border rounded-lg text-sm"
              >
                <option value={0}>Seleccionar diseño</option>
                {disenos.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={item.cantidad}
                onChange={(e) => updateItem(i, 'cantidad', Number(e.target.value))}
                className="w-20 px-2 py-2 border rounded-lg text-sm"
              />

              <input
                type="number"
                value={item.precio_unitario}
                onChange={(e) => updateItem(i, 'precio_unitario', Number(e.target.value))}
                className="w-24 px-2 py-2 border rounded-lg text-sm"
              />

              <button onClick={() => removeItem(i)}>
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-4">
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <Plus size={14} /> Añadir
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateVentaModal