import { useState, useEffect, useRef, useMemo } from 'react' // Añadido useMemo
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Plus,
  FolderOpen,
  Package,
  Pencil,
  ImageOff,
  LayoutGrid,
  FilePlus,
  FolderPlus,
  Trash,
  Search, // Añadido Search
  X // Añadido X para limpiar
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getNodoById, deleteNodo, getAncestros } from '../../api/nodo.api'
import type { Nodo, Ancestro } from '../../types/nodo.types'
import type { Diseno } from '../../types/diseno.types'

import CreateNodoModal from '../../components/modals/CreateNodoModal'
import CreateDisenoModal from '../../components/modals/CreateDisenoModal'
import ConfirmAlert from '../../components/ConfirmAlert'
import LoadingScreen from '../../components/LoadingScreen'
import WarningAlert from '../../components/WarningAlert'

const NodoDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [nodoActual, setNodoActual] = useState<any | null>(null)
  const [hijos, setHijos] = useState<Nodo[]>([])
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // Estado para el buscador

  const [menuOpen, setMenuOpen] = useState(false)
  const [modalNodoOpen, setModalNodoOpen] = useState(false)
  const [modalDisenoOpen, setModalDisenoOpen] = useState(false)
  const [selectedNodo, setSelectedNodo] = useState<Nodo | null>(null)
  const [alertConfig, setAlertConfig] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [warningOpen, setWarningOpen] = useState(false)
  const [ancestros, setAncestros] = useState<Ancestro[]>([])

  const menuRef = useRef<HTMLDivElement>(null)

  // Lógica de Filtrado con useMemo
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    const filteredHijos = hijos.filter(h => 
      h.nombre.toLowerCase().includes(term)
    );

    const filteredDisenos = disenos.filter(d => 
      d.activo &&(
      d.nombre.toLowerCase().includes(term) || 
      d.codigo?.toLowerCase().includes(term))
    );

    return { filteredHijos, filteredDisenos };
  }, [searchTerm, hijos, disenos]);

  const fetchData = async () => {
  if (!id) return
  try {
    setLoading(true)
    const [data, ancs] = await Promise.all([
      getNodoById(Number(id)),
      getAncestros(Number(id)),
    ])
    setNodoActual(data)
    setHijos(data.other_nodos || [])
    setDisenos(data.disenos || [])
    setAncestros(ancs)
  } catch (error) {
    toast.error('Error al cargar la información')
    navigate('/productos')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => { fetchData() }, [id])

  const handleDisenoSuccess = () => {
    setModalDisenoOpen(false)
    fetchData()
    toast.success('Nuevo diseño creado correctamente')
  }

  const handleNodoSuccess = () => {
    setModalNodoOpen(false)
    setSelectedNodo(null)
    fetchData()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDeleteNodo = async () => {
    if (!alertConfig.id) return
    try {
      await deleteNodo(alertConfig.id)
      setHijos(prev => prev.filter(h => h.id !== alertConfig.id))
      toast.success('Carpeta eliminada')
    } catch (error) {
      toast.error('Error al eliminar')
    } finally {
      setAlertConfig({ open: false, id: null })
    }
  }

  if (loading) return <LoadingScreen />
  if (!nodoActual) return null

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500">

     {/* Breadcrumb */}
<div className="flex items-center gap-2 text-sm text-gray-400 mb-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
  <button
    onClick={() => navigate('/productos')}
    className="hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0"
  >
    <Package size={14} /> Productos
  </button>

  {/* Ancestros dinámicos — todos menos el último (que es el nodo actual) */}
  {ancestros.slice(0, -1).map((anc) => (
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

  {/* Nodo actual — siempre el último */}
  <ChevronRight size={14} className="shrink-0" />
  <span className="text-gray-700 font-bold bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
    {nodoActual.nombre}
  </span>
</div>
 

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{nodoActual.nombre}</h1>
          <p className="text-sm text-gray-400">Gestiona las carpetas y diseños de este nivel</p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 w-full sm:w-auto"
          >
            <Plus size={20} /> Nuevo
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => { setModalNodoOpen(true); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
              >
                <FolderPlus size={18} /> Nueva carpeta
              </button>
              <button
                onClick={() => { setModalDisenoOpen(true); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
              >
                <FilePlus size={18} /> Nuevo diseño
              </button>
            </div>
          )}
        </div>
      </div>

           {/* BUSCADOR UNIFICADO - Diseño minimalista integrado */}
      <div className="relative mb-8 max-w-md flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder={`Buscar en ${nodoActual.nombre}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN: CARPETAS FILTRADAS */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Carpetas {searchTerm && `(${filteredData.filteredHijos.length})`}
          </h2>
        </div>

        {filteredData.filteredHijos.length === 0 ? (
          <p className="text-xs text-gray-400 italic ml-1">
            {searchTerm ? 'No hay carpetas que coincidan.' : 'No hay subcarpetas aquí.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredData.filteredHijos.map((h: any) => {
              const countNodos = h._count?.other_nodos ?? h.other_nodos?.length ?? 0;
              const countDisenos = h._count?.disenos ?? h.disenos?.length ?? 0;
              const tieneContenido = countNodos > 0 || countDisenos > 0;

              return (
                <div
                  key={h.id}
                  onClick={() => navigate(`/nodos/${h.id}`)}
                  className="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <FolderOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-700 truncate">{h.nombre}</p>
                      <p className="text-[10px] text-gray-400">
                        {countNodos} {countNodos === 1 ? 'carpeta' : 'carpetas'} • {countDisenos} {countDisenos === 1 ? 'diseño' : 'diseños'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedNodo(h); setModalNodoOpen(true); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tieneContenido) {
                          setWarningOpen(true);
                        } else {
                          setAlertConfig({ open: true, id: h.id });
                        }
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN: DISEÑOS FILTRADOS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid size={18} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Diseños {searchTerm && `(${filteredData.filteredDisenos.length})`}
          </h2>
        </div>

        {filteredData.filteredDisenos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <ImageOff size={32} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">
              {searchTerm ? 'No hay diseños que coincidan.' : 'Aún no hay diseños en esta carpeta'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredData.filteredDisenos.map((diseno) => (
              <div
                key={diseno.id}
                onClick={() => navigate(`/disenos/${diseno.id}`)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden cursor-pointer group"
              >
                <div className="flex items-center gap-4 p-3 md:p-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    {diseno.imagen ? (
                      <img src={diseno.imagen} alt={diseno.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageOff size={18} className="text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-800 truncate">{diseno.nombre}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${diseno.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {diseno.activo ? 'Activo' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-blue-500 font-medium">{diseno.codigo}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 px-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-gray-800">${parseFloat(String(diseno.precio)).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-400 italic">Precio Unit.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateNodoModal isOpen={modalNodoOpen} onClose={() => { setModalNodoOpen(false); setSelectedNodo(null); }} onSuccess={handleNodoSuccess} nodoToEdit={selectedNodo} padre_id={Number(id)} />
      <CreateDisenoModal isOpen={modalDisenoOpen} onClose={() => setModalDisenoOpen(false)} onSuccess={handleDisenoSuccess} nodoId={Number(id)} />

      <ConfirmAlert
        isOpen={alertConfig.open}
        title="¿Eliminar carpeta?"
        message="Esta carpeta solo se puede eliminar si está vacía."
        onConfirm={handleDeleteNodo}
        onCancel={() => setAlertConfig({ open: false, id: null })}
      />

      <WarningAlert
        isOpen={warningOpen}
        title="Carpeta con contenido"
        message="La carpeta contiene diseños o carpetas y no se puede eliminar. Primero vacíe la carpeta."
        onClose={() => setWarningOpen(false)}
      />
    </div>
  )
}

export default NodoDetalle