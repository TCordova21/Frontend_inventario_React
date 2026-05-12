import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ChevronRight, ImageOff, Plus, Pencil,
    X, Package, Trash2
} from 'lucide-react'
import { toast } from 'react-toastify'

// APIs
import { getDisenoById, updateDiseno, deleteDiseno } from '../../api/disenos.api'
import { getDisenoColorsByDiseno, deleteDisenoColor } from '../../api/disenoColor.api'

// Tipos y Componentes
import type { Diseno, DisenoColor } from '../../types/diseno.types'
import AddColorModal from '../../components/modals/AddColorModal'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmAlert from '../../components/ConfirmAlert'
import WarningAlert from '../../components/WarningAlert'
import { getAncestros } from '../../api/nodo.api'
import type { Ancestro } from '../../types/nodo.types'
import { getImageUrl } from '../../utils/image'

const DisenoDetalle = () => {
    const { disenoId } = useParams()
    const navigate = useNavigate()

    // Estados de Datos
    const [diseno, setDiseno] = useState<Diseno | null>(null)
    const [colores, setColores] = useState<DisenoColor[]>([])
    const [loading, setLoading] = useState(true)

    // Estados de Edición
    const [editando, setEditando] = useState(false)
    const [form, setForm] = useState({ nombre: '', descripcion: '', codigo: '', precio: '' })
    const [saving, setSaving] = useState(false)

    // Estados de Modales y Alertas
    const [modalColorOpen, setModalColorOpen] = useState(false)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [ancestros, setAncestros] = useState<Ancestro[]>([])

    const [mensajeErrorStock, setMensajeErrorStock] = useState("");
    const [warningStockOpen, setWarningStockOpen] = useState(false);

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

            // Cargar ancestros del nodo contenedor si existe
            if (d.nodo_id) {
                const ancs = await getAncestros(d.nodo_id)
                setAncestros(ancs)
            }
        } catch (error) {
            toast.error('Error al cargar el diseño')
            navigate('/productos')
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
            toast.success("Diseño actualizado correctamente")
        } catch (error) {
            toast.error("Error al guardar cambios")
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteDiseno = async () => {
        if (!diseno) return;

        try {
            setDeleting(true);
            await deleteDiseno(Number(disenoId));
            toast.success("Diseño eliminado correctamente");
            navigate(`/nodos/${diseno?.nodo_id}`);
        } catch (error: any) {
            // Capturamos el error 400 (BadRequestException) del backend
            if (error.response?.status === 400) {
                const mensaje = error.response.data.message; // El mensaje del backend
                setMensajeErrorStock(mensaje);
                setConfirmDeleteOpen(false); // Cerramos el de confirmación
                setWarningStockOpen(true);   // Abrimos el de advertencia
            } else {
                toast.error("Error al eliminar el diseño");
            }
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
        }
    };
    const handleRemoveColor = async (dcId: number) => {
        try {
            await deleteDisenoColor(dcId)
            setColores((prev) => prev.filter((c) => c.id !== dcId))
            toast.success("Color quitado")
        } catch (error) {
            toast.error("No se pudo quitar el color")
        }
    }

    if (loading) return <LoadingScreen />
    if (!diseno) return (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">
            Diseño no encontrado
        </div>
    )

    const coloresAsignados = colores.map((c) => c.color_id)

    return (
        <div className="p-4 md:p-6 animate-in fade-in duration-500">
            {/* Breadcrumb Dinámico */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                <button
                    onClick={() => navigate('/productos')}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0"
                >
                    <Package size={14} /> Productos
                </button>

                {/* Ancestros completos del nodo contenedor */}
                {ancestros.map((anc) => (
                    <>
                        <ChevronRight key={`sep-${anc.id}`} size={14} className="shrink-0" />
                        <button
                            key={anc.id}
                            onClick={() => navigate(`/nodos/${anc.id}`)}
                            className="hover:text-blue-600 transition-colors shrink-0"
                        >
                            {anc.nombre}
                        </button>
                    </>
                ))}

                {/* Diseño actual */}
                <ChevronRight size={14} className="shrink-0" />
                <span className="text-gray-700 font-bold bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                    {diseno.nombre}
                </span>
            </div>
            {/* Layout Principal */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                {/* Columna Izquierda — Imagen */}
                <div className="md:col-span-1 w-full">
                    <div className="aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center group">
                        {diseno.imagen ? (
                            <img
                                src={getImageUrl(diseno.imagen)}
                                alt={diseno.nombre}
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-300">
                                <ImageOff size={48} strokeWidth={1.5} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Estado del Diseño</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${diseno.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-[11px] font-medium text-gray-700">{diseno.activo ? 'Activo para la venta' : 'Pausado'}</span>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha — Info + Colores */}
                <div className="md:col-span-3 flex flex-col gap-6">

                    {/* Card info */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        {!editando ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                    <div className="min-w-0">
                                        <h1 className="text-xl font-black text-gray-800 mb-1">{diseno.nombre}</h1>
                                        <p className="text-sm font-mono text-blue-500 font-bold mb-3">{diseno.codigo}</p>
                                        {diseno.descripcion ? (
                                            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{diseno.descripcion}</p>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic font-light">Sin descripción detallada.</p>
                                        )}
                                    </div>
                                    <div className="shrink-0 text-left sm:text-right bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Precio Unitario</p>
                                        <span className="text-3xl font-black text-gray-900">
                                            ${parseFloat(String(diseno.precio || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* ... dentro de !editando ... */}
                                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                                    <button
                                        onClick={() => setEditando(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 shadow-sm active:scale-95"
                                    >
                                        <Pencil size={16} />
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => setConfirmDeleteOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-200 shadow-sm active:scale-95 group"
                                    >
                                        <Trash2 size={16} className="group-hover:animate-pulse" />
                                        Eliminar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Nombre del Diseño</label>
                                        <input
                                            value={form.nombre}
                                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Código / Referencia</label>
                                        <input
                                            value={form.codigo}
                                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Descripción</label>
                                    <textarea
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        rows={3}
                                        className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Detalles del material, estilo..."
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 sm:w-1/3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Precio ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.precio}
                                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                            className="pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50 items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || deleting}
                                            className="flex-1 sm:flex-none flex items-center justify-center text-sm gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-medium shadow-lg shadow-blue-100"
                                        >
                                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <button
                                            onClick={() => setEditando(false)}
                                            disabled={saving || deleting}
                                            className="flex-1 sm:flex-none flex items-center justify-center text-sm gap-2 px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-medium"
                                        >
                                            Cancelar
                                        </button>
                                    </div>


                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Colores */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-black text-gray-800">Variantes de Color</h2>
                                <p className="text-xs text-gray-400 font-medium">Colores disponibles para este diseño</p>
                            </div>
                            <button
                                onClick={() => setModalColorOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                            >
                                <Plus size={16} />
                                Vincular Color
                            </button>
                        </div>

                        {colores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                                <p className="text-sm text-gray-400 font-medium">No hay variantes de color configuradas</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {colores.map((dc) => (
                                    <div
                                        key={dc.id}
                                        className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl group hover:border-blue-400 transition-all shadow-sm"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl border-4 border-gray-50 shadow-inner shrink-0"
                                            style={{ backgroundColor: dc.colores?.codigo_hex }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-gray-700 truncate capitalize">
                                                {dc.colores?.nombre}
                                            </p>
                                            <p className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                                                {dc.colores?.codigo_hex}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveColor(dc.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={18} />
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
                disenoId={Number(disenoId)}
                coloresAsignados={coloresAsignados}
            />

            <ConfirmAlert
                isOpen={confirmDeleteOpen}
                title="¿Eliminar este diseño?"
                message={`Esta acción marcará el diseño "${diseno.nombre}" como inactivo. Ya no aparecerá en el inventario activo.`}
                onConfirm={handleDeleteDiseno}
                onCancel={() => setConfirmDeleteOpen(false)}
            />
            <WarningAlert
                isOpen={warningStockOpen}
                title="Restricción de Inventario"
                message={mensajeErrorStock} // Pasamos el mensaje dinámico del servidor
                onClose={() => setWarningStockOpen(false)}
            />
        </div>
    )
}

export default DisenoDetalle