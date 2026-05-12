import { useState, useEffect } from 'react'
import { X, ImageOff, Package, Link2, Loader2, ImagePlus, Trash2 } from 'lucide-react'
import { createDiseno } from '../../api/disenos.api'
import type { CreateDisenoDto, Diseno } from '../../types/diseno.types'
import { getImageUrl } from '../../utils/image'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (diseno: Diseno) => void  // ← ahora devuelve el diseño
  nodoId?: number              // ← preselecciona la subcategoría
}


const EMPTY_FORM: CreateDisenoDto = {
  nombre: '',
  imagen: '',
  descripcion: '',
  codigo: '',
  nodo_id: 0,

}

const CreateDisenoModal = ({ isOpen, onClose, onSuccess, nodoId }: Props) => {
  const [form, setForm] = useState<CreateDisenoDto>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (nodoId) {
      setForm((prev) => ({ ...prev, nodo_id: nodoId }))
    }
  }, [nodoId, isOpen])


  if (!isOpen) return null
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === 'imagen') {
      setImgError(false)
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }))

    setError(null)
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      setUploadingImage(true)
      setImgError(false)

      const imageUrl = await uploadToCloudinary(file)

      setForm(prev => ({
        ...prev,
        imagen: imageUrl
      }))

    } catch (error) {
      console.error(error)
      setError('Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre?.trim()) return setError('El nombre es obligatorio')
    if (!form.codigo?.trim()) return setError('El código es obligatorio')
    if (!form.nodo_id) return setError('Selecciona una subcategoría')
    try {
      setLoading(true)
      const disenoCreado = await createDiseno({
        ...form,
        nodo_id: Number(form.nodo_id),
      })
      setForm(EMPTY_FORM)
      onSuccess(disenoCreado)  // ← pasa el objeto completo
    } catch {
      setError('Error al crear el diseño')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Nuevo diseño</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview imagen 
          <div className="w-full h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {form.imagen && !imgError ? (
              <img
                src={getImageUrl(form.imagen)}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('ERROR IMG:', e.currentTarget.src)
                  setImgError(true)
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-300">
                <ImageOff size={32} />
                <span className="text-xs">Vista previa</span>
              </div>
            )}
          </div>
*/}
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Vegeta"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Código */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ej: DRA-VEG-001"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* URL Imagen */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              Imagen del Producto
            </label>

            <div className="group relative bg-gray-50/50 rounded-2xl border  border-gray-200 p-4 transition-all hover:bg-blue-50/30">

              {/* Vista previa y Controles */}
              <div className="flex flex-col md:flex-row items-center gap-4">

                {/* Miniatura de Previa */}
                <div className="w-35 h-35 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  {form.imagen ? (
                    <img src={getImageUrl(form.imagen)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-1">
                      <Package size={24} />
                      <span className="text-[8px] font-bold">SIN PREVIA</span>
                    </div>
                  )}
                </div>

                {/* Input de URL y Botón de Archivo */}
                <div className="flex-1 w-full space-y-2">
                  <div className="relative">
                    <input
                      name="imagen"
                      value={form.imagen}
                      onChange={handleChange}
                      placeholder="Pega el enlace de la imagen aquí..."
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white transition-all "
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Link2 size={14} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className={`
            flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-semibold transition-all cursor-pointer border
            ${uploadingImage
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 '
                      }
          `}>
                      {uploadingImage ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ImagePlus size={14} />
                      )}
                      {uploadingImage ? 'Procesando...' : 'Subir Archivo Local'}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>

                    {form.imagen && (
                      <button
                        type="button"
                        onClick={() => handleChange({ target: { name: 'imagen', value: '' } } as any)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar imagen"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dropzone Hint */}
              {!form.imagen && !uploadingImage && (
                <p className="text-center text-[9px] text-gray-400 font-light mt-3 ">
                  Puedes pegar un link directo o seleccionar un archivo de tu equipo
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Diseño de Vegeta Super Saiyan"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>



          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Crear diseño'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateDisenoModal