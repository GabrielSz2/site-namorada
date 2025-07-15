import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Check, X, Gift, ShoppingBag, BookOpen, Sparkles, ExternalLink, Filter, Search, Upload, Camera, Star, Crown, Gem } from 'lucide-react';
import { presentsService, Present } from './lib/supabase';

const categories = [
  { id: 'all', name: 'Todos', icon: Gift },
  { id: 'moda', name: 'Moda', icon: ShoppingBag },
  { id: 'beleza', name: 'Beleza', icon: Sparkles },
  { id: 'livros', name: 'Livros', icon: BookOpen },
  { id: 'acessorios', name: 'Acessórios', icon: Heart },
  { id: 'outros', name: 'Outros', icon: Gift }
];

const priorities = [
  { 
    id: 'sonho', 
    name: 'Sonho dos Sonhos', 
    icon: Crown, 
    color: 'from-purple-400 to-pink-400',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    description: '✨ O que mais desejo no mundo!'
  },
  { 
    id: 'querido', 
    name: 'Muito Querido', 
    icon: Gem, 
    color: 'from-pink-400 to-rose-400',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    description: '💎 Seria incrível ganhar!'
  },
  { 
    id: 'desejo', 
    name: 'Desejo Fofo', 
    icon: Star, 
    color: 'from-rose-300 to-pink-300',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    description: '⭐ Seria um mimo lindo!'
  }
];

function App() {
  const [presents, setPresents] = useState<Present[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPresent, setEditingPresent] = useState<Present | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showReceived, setShowReceived] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load presents from Supabase on mount
  useEffect(() => {
    loadPresents();
  }, []);

  const loadPresents = async () => {
    try {
      setLoading(true);
      const data = await presentsService.getAll();
      setPresents(data);
    } catch (error) {
      console.error('Error loading presents:', error);
      // Fallback to localStorage if Supabase fails
      const savedPresents = localStorage.getItem('julia-presents');
      if (savedPresents) {
        setPresents(JSON.parse(savedPresents));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPresents = presents.filter(present => {
    const matchesCategory = selectedCategory === 'all' || present.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || present.priority === selectedPriority;
    const matchesStatus = showReceived || !present.received;
    const matchesSearch = present.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
  });

  const addPresent = async (presentData: Omit<Present, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPresent = await presentsService.create(presentData);
      setPresents([newPresent, ...presents]);
      // Backup to localStorage
      localStorage.setItem('julia-presents', JSON.stringify([newPresent, ...presents]));
    } catch (error) {
      console.error('Error adding present:', error);
      // Fallback to localStorage
      const newPresent: Present = {
        ...presentData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedPresents = [newPresent, ...presents];
      setPresents(updatedPresents);
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
    }
  };

  const updatePresent = async (id: string, updates: Partial<Present>) => {
    try {
      const updatedPresent = await presentsService.update(id, updates);
      const updatedPresents = presents.map(present => 
        present.id === id ? updatedPresent : present
      );
      setPresents(updatedPresents);
      // Backup to localStorage
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
    } catch (error) {
      console.error('Error updating present:', error);
      // Fallback to localStorage
      const updatedPresents = presents.map(present => 
        present.id === id ? { ...present, ...updates } : present
      );
      setPresents(updatedPresents);
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
    }
  };

  const deletePresent = async (id: string) => {
    try {
      await presentsService.delete(id);
      const updatedPresents = presents.filter(present => present.id !== id);
      setPresents(updatedPresents);
      // Backup to localStorage
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
    } catch (error) {
      console.error('Error deleting present:', error);
      // Fallback to localStorage
      const updatedPresents = presents.filter(present => present.id !== id);
      setPresents(updatedPresents);
      localStorage.setItem('julia-presents', JSON.stringify(updatedPresents));
    }
  };

  const toggleReceived = (id: string) => {
    const present = presents.find(p => p.id === id);
    if (present) {
      updatePresent(id, { received: !present.received });
    }
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.id === priority) || priorities[1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <p className="text-xl text-gray-600 font-light">Carregando os presentes da Júlia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200/50 via-rose-200/50 to-pink-300/50"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-xl">
                <Heart className="w-16 h-16 text-white" fill="currentColor" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 font-serif">
              Lista de Presentes da Júlia
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
              Oi! Essa é a minha lista de presentes para você me mimar 😍✨
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Controls */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar presente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-pink-400 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-600 hover:bg-pink-100 hover:scale-102'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Priority Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedPriority('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                selectedPriority === 'all'
                  ? 'bg-gray-400 text-white shadow-lg scale-105'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Todas Prioridades</span>
            </button>
            {priorities.map(priority => {
              const Icon = priority.icon;
              return (
                <button
                  key={priority.id}
                  onClick={() => setSelectedPriority(priority.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    selectedPriority === priority.id
                      ? `bg-gradient-to-r ${priority.color} text-white shadow-lg scale-105`
                      : `${priority.bgColor} ${priority.textColor} hover:scale-102`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{priority.name}</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter and Add Button */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowReceived(!showReceived)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                showReceived
                  ? 'bg-green-400 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-green-100'
              }`}
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Mostrar já ganhos</span>
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Adicionar Presente</span>
            </button>
          </div>
        </div>

        {/* Presents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresents.map(present => {
            const priorityInfo = getPriorityInfo(present.priority);
            const PriorityIcon = priorityInfo.icon;
            
            return (
              <div
                key={present.id}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group ${
                  present.received ? 'ring-2 ring-green-300' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-rose-100 rounded-t-2xl flex items-center justify-center overflow-hidden">
                    {present.image ? (
                      <img
                        src={present.image}
                        alt={present.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                      />
                    ) : (
                      <Gift className="w-12 h-12 text-pink-400" />
                    )}
                  </div>
                  
                  {/* Priority Badge */}
                  <div className={`absolute top-3 left-3 ${priorityInfo.bgColor} ${priorityInfo.textColor} px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1`}>
                    <PriorityIcon className="w-3 h-3" />
                    <span>{priorityInfo.name}</span>
                  </div>
                  
                  {present.received && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      ✓ Já ganhei!
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                      {present.name}
                    </h3>
                    <span className="text-sm bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                      {categories.find(c => c.id === present.category)?.name}
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    R$ {present.price}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleReceived(present.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 ${
                        present.received
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      {present.received ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Já ganhei</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">Ainda quero</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingPresent(present);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    {present.store_link && (
                      <a
                        href={present.store_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPresents.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 font-light">
              {searchTerm ? 'Nenhum presente encontrado' : 'Nenhum presente adicionado ainda'}
            </p>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Tente outro termo de busca' : 'Que tal adicionar o primeiro presente?'}
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <PresentModal
          present={editingPresent}
          onSave={editingPresent ? 
            (data) => updatePresent(editingPresent.id, data) : 
            addPresent
          }
          onDelete={editingPresent ? () => deletePresent(editingPresent.id) : undefined}
          onClose={() => {
            setShowModal(false);
            setEditingPresent(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-200 via-rose-200 to-pink-300 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-pink-600" fill="currentColor" />
            <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
            <Heart className="w-6 h-6 text-pink-600" fill="currentColor" />
          </div>
          <p className="text-lg text-gray-700 font-light">
            Obrigada por pensar em mim ❤️ — Júlia
          </p>
        </div>
      </footer>
    </div>
  );
}

function PresentModal({ 
  present, 
  onSave, 
  onDelete, 
  onClose 
}: {
  present: Present | null;
  onSave: (data: Omit<Present, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: present?.name || '',
    price: present?.price || '',
    image: present?.image || '',
    category: present?.category || 'outros',
    store_link: present?.store_link || '',
    received: present?.received || false,
    priority: present?.priority || 'querido'
  });
  const [imagePreview, setImagePreview] = useState<string>(present?.image || '');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData({...formData, image: result});
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData({...formData, image: url});
    setImagePreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.price) {
      onSave(formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Tem certeza que deseja excluir este presente?')) {
      onDelete();
      onClose();
    }
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.id === priority) || priorities[1];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {present ? 'Editar Presente' : 'Novo Presente'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Presente *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
                placeholder="Ex: Bolsa rosa linda"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Aproximado *
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
                placeholder="Ex: 150,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
              >
                {categories.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Prioridade *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {priorities.map(priority => {
                  const Icon = priority.icon;
                  return (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setFormData({...formData, priority: priority.id})}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.priority === priority.id
                          ? `border-pink-400 bg-gradient-to-r ${priority.color} text-white shadow-lg`
                          : `border-gray-200 ${priority.bgColor} ${priority.textColor} hover:border-pink-300`
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold">{priority.name}</span>
                      </div>
                      <p className="text-sm opacity-90">{priority.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Foto do Presente
              </label>
              
              {/* Upload Method Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    uploadMethod === 'upload'
                      ? 'bg-pink-400 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    uploadMethod === 'url'
                      ? 'bg-pink-400 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Link</span>
                </button>
              </div>

              {uploadMethod === 'upload' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-pink-300 rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all duration-300"
                    >
                      <Camera className="w-8 h-8 text-pink-400 mb-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        Clique para escolher uma foto
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG até 5MB
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                      onError={() => {
                        setImagePreview('');
                        if (uploadMethod === 'url') {
                          setFormData({...formData, image: ''});
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({...formData, image: ''});
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link da Loja
              </label>
              <input
                type="url"
                value={formData.store_link}
                onChange={(e) => setFormData({...formData, store_link: e.target.value})}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none transition-colors"
                placeholder="https://loja.com/produto"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="received"
                checked={formData.received}
                onChange={(e) => setFormData({...formData, received: e.target.checked})}
                className="w-5 h-5 text-pink-600 border-2 border-pink-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="received" className="text-sm font-medium text-gray-700">
                Já ganhei este presente
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all duration-300 font-medium"
              >
                {present ? 'Salvar' : 'Adicionar'}
              </button>
              
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 font-medium"
                >
                  Excluir
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;