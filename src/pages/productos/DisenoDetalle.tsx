import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ChevronRight, ImageOff, Plus, Pencil,
    Trash2, X, Check,
} from 'lucide-react'
import { getDisenoById, updateDiseno, deleteDiseno } from '../../api/disenos.api'
import { getDisenoColorsByDiseno, deleteDisenoColor } from '../../api/disenoColor.api'
import type { Diseno, DisenoColor } from '../../types/diseno.types'
import AddColorModal from '../../components/modals/AddColorModal'
import LoadingScreen from '../../components/LoadingScreen'

const DisenoDetalle = () => {
    const { productoId, categoriaId, subcategoriaId, disenoId } = useParams()
    const navigate = useNavigate()

    const [diseno, setDiseno] = useState<Diseno | null>(null)
    const [colores, setColores] = useState<DisenoColor[]>([])
    const [loading, setLoading] = useState(true)
    const [modalColorOpen, setModalColorOpen] = useState(false)
    const [editando, setEditando] = useState(false)
    const [form, setForm] = useState({ nombre: '', descripcion: '', codigo: '', precio: '' })
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            const [d, dc] = await Promise.all([
                getDisenoById(Number(disenoId)),
                getDisenoColorsByDiseno(Number(disenoId)),
            ])
            setDiseno(d)
            setColores(Array.isArray(dc) ? dc : [])
            setForm({
                nombre: d.nombre || '',
                descripcion: d.descripcion || '',
                codigo: d.codigo || '',
                precio: d.precio ? String(d.precio) : '',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [disenoId])

    const handleSave = async () => {
        if (!diseno) return
        try {
            setSaving(true)
            await updateDiseno(diseno.id, {
                nombre: form.nombre,
                descripcion: form.descripcion,
                codigo: form.codigo,
                precio: form.precio ? Number(form.precio) : undefined,
            })
            await fetchData()
            setEditando(false)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!diseno) return
        try {
            setDeleting(true)
            await deleteDiseno(diseno.id)
            navigate(`/productos/${productoId}/${categoriaId}/${subcategoriaId}`)
        } finally {
            setDeleting(false)
        }
    }

    const handleRemoveColor = async (dcId: number) => {
        await deleteDisenoColor(dcId)
        setColores((prev) => prev.filter((c) => c.id !== dcId))
    }

    if (loading) return <LoadingScreen />
    if (!diseno) return (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Diseño no encontrado
        </div>
    )

    const coloresAsignados = colores.map((c) => c.color_id)

    // ... (mismos imports y lógica de estado anteriores)

    return (
        <div className="p-4 md:p-6 ">
            {/* Breadcrumb - Añadido scroll horizontal para móvil */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                <button onClick={() => navigate('/productos')} className="hover:text-blue-500 transition-colors">Productos</button>
                <ChevronRight size={14} className="shrink-0" />
                <button onClick={() => navigate(`/productos/${productoId}`)} className="hover:text-blue-500 transition-colors">Producto</button>
                <ChevronRight size={14} className="shrink-0" />
                <button onClick={() => navigate(`/productos/${productoId}/${categoriaId}`)} className="hover:text-blue-500 transition-colors">Categoría</button>
                <ChevronRight size={14} className="shrink-0" />
                <button onClick={() => navigate(`/productos/${productoId}/${categoriaId}/${subcategoriaId}`)} className="hover:text-blue-500 transition-colors">Subcategoría</button>
                <ChevronRight size={14} className="shrink-0" />
                <span className="text-gray-700 font-medium">{diseno.nombre}</span>
            </div>

            {/* Layout responsivo: 1 col en móvil, 4 cols en escritorio (1 para imagen, 3 para info) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                {/* Columna izquierda — Imagen */}
                <div className="md:col-span-1 w-full h-auto ">
                    <div className="aspect-square md:aspect-auto md:h-64 lg:h-80 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {diseno.imagen ? (
                            <img
                                src={diseno.imagen}
                                alt={diseno.nombre}
                                className="w-full h-full object-scale-down"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-300">
                                <ImageOff size={40} />
                                <span className="text-xs">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    {/* 
                    <div className="mt-3 flex items-center justify-center md:justify-start">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${diseno.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>
                            {diseno.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                     */}
                </div>

                {/* Columna derecha — Info + Colores (Ocupa 3 columnas en escritorio) */}
                <div className="md:col-span-3 flex flex-col gap-5">

                    {/* Card info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        {!editando ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div className="min-w-0">
                                        <h1 className="text-xl md:text-lg font-semibold text-gray-800 mb-1">{diseno.nombre}</h1>
                                        <p className="text-xs font-mono text-gray-400 mb-2">{diseno.codigo}</p>
                                        {diseno.descripcion && (
                                            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{diseno.descripcion}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                                        {diseno.precio ? (
                                            <span className="text-xl font-bold text-gray-800">
                                                ${parseFloat(String(diseno.precio)).toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin precio</span>
                                        )}
                                        {diseno.subcategorias && (
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                {diseno.subcategorias.nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => setEditando(true)}
                                        className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 sm:border-transparent"
                                    >
                                        <Pencil size={14} />
                                        Editar
                                    </button>
                                    {/* <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:ml-auto border border-red-100 sm:border-transparent"
                                    >
                                        <Trash2 size={14} />
                                        Eliminar
                                    </button> */}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Fila 1: Nombre y Código */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Nombre</label>
                                        <input
                                            value={form.nombre}
                                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Código</label>
                                        <input
                                            value={form.codigo}
                                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Fila 2: Descripción (Textarea) */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Descripción</label>
                                    <textarea
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        rows={3}
                                        className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full resize-none"
                                        placeholder="Añade una descripción detallada..."
                                    />
                                </div>

                                {/* Fila 3: Precio */}
                                <div className="flex flex-col gap-1 sm:w-1/3">
                                    <label className="text-xs font-medium text-gray-500">Precio ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.precio}
                                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                            className="pl-7 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                        />
                                    </div>
                                </div>


                                {/* Botones de acción */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-1.5 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                                    >
                                        <Check size={14} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                    <button
                                        onClick={() => { setEditando(false);  }}
                                        className="w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center gap-1.5 px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                    >
                                        <X size={14} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card colores */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">Colores asignados</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{colores.length} colores disponibles</p>
                            </div>
                            <button
                                onClick={() => setModalColorOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus size={16} />
                                Añadir color
                            </button>
                        </div>

                        {colores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
                                <p className="text-sm text-gray-400 font-medium">No hay colores asignados aún</p>
                                <button
                                    onClick={() => setModalColorOpen(true)}
                                    className="text-blue-600 text-sm font-semibold hover:underline"
                                >
                                    Configurar primer color
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {colores.map((dc) => (
                                    <div
                                        key={dc.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl group hover:bg-white hover:border-blue-200 transition-all shadow-sm sm:shadow-none"
                                    >
                                        <span
                                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0"
                                            style={{ backgroundColor: dc.colores?.codigo_hex }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-700 truncate">
                                                {dc.colores?.nombre}
                                            </p>
                                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                                                {dc.colores?.codigo_hex}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveColor(dc.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                                            title="Quitar color"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddColorModal
                isOpen={modalColorOpen}
                onClose={() => setModalColorOpen(false)}
                onSuccess={fetchData}
                disenoId={diseno.id}
                coloresAsignados={coloresAsignados}
            />
        </div>

    )
}





export default DisenoDetalle