import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './EntityManagement.module.css';
import Modal from '../components/Modal/Modal';
import apiClient from '../services/apiClient';
import { OrganizationListSkeleton } from '../components/Skeleton';

const ENTITY_TYPES = [
  { id: 'role', label: 'Roles' },
  { id: 'specialization', label: 'Specializations' },
  { id: 'work_type', label: 'Work Types' },
  { id: 'shift', label: 'Shifts' },
  { id: 'experience', label: 'Experience' },
  { id: 'urgency', label: 'Urgency' }
];

const EntityManagement = () => {
  const [activeTab, setActiveTab] = useState('role');
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    sort_order: 0,
    is_active: true,
    parent_id: ''
  });
  const [expandedRoles, setExpandedRoles] = useState(new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: activeTab };
      if (debouncedSearch) params.q = debouncedSearch;
      const res = await apiClient.get('/admin/entities/all', { params });
      
      let data = res.data.data;

      // If on role tab, we also need specializations to build the tree
      if (activeTab === 'role') {
        const specRes = await apiClient.get('/admin/entities/all', { params: { type: 'specialization' } });
        const allSpecs = specRes.data.data;
        
        // Map specializations to their parents
        data = data.map(role => ({
          ...role,
          specializations: allSpecs.filter(s => s.parent_id === role.id)
        }));
      }

      setEntities(data);

      // Fetch roles if we are on specialization tab to populate parent dropdown
      if (activeTab === 'specialization') {
        const rolesRes = await apiClient.get('/admin/entities/all', { params: { type: 'role' } });
        setRoles(rolesRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntity) {
        await apiClient.put(`/admin/entities/${editingEntity.id}`, formData);
        toast.success('Entity updated successfully');
      } else {
        await apiClient.post('/admin/entities', { ...formData, type: activeTab });
        toast.success('Entity created successfully');
      }
      setIsModalOpen(false);
      setEditingEntity(null);
      setFormData({ label: '', value: '', sort_order: 0, is_active: true, parent_id: '' });
      fetchEntities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete this ${activeTab.slice(0, -1)}? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/admin/entities/${id}`);
      toast.success('Entity deleted successfully');
      fetchEntities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggle = async (entity) => {
    const action = entity.is_active ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this ${activeTab.slice(0, -1)}?`)) return;
    try {
      await apiClient.put(`/admin/entities/${entity.id}`, { is_active: !entity.is_active });
      toast.success(`${entity.label} ${entity.is_active ? 'disabled' : 'enabled'} successfully`);
      fetchEntities();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const openModal = (entity = null) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({
        label: entity.label,
        value: entity.value,
        sort_order: entity.sort_order,
        is_active: entity.is_active,
        parent_id: entity.parent_id || ''
      });
    } else {
      setEditingEntity(null);
      setFormData({ 
        label: '', 
        value: '', 
        sort_order: entities.length + 1, 
        is_active: true,
        parent_id: '' 
      });
    }
    setIsModalOpen(true);
  };

  const openAddChildModal = (role) => {
    setEditingEntity(null);
    setFormData({ 
      label: '', 
      value: '', 
      sort_order: (role.specializations?.length || 0) + 1, 
      is_active: true,
      parent_id: role.id 
    });
    setActiveTab('specialization'); // Switch to specialization tab settings internally for modal logic
    setIsModalOpen(true);
  };

  const toggleExpand = (roleId) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Entity Management</h1>
          <p className={styles.subtitle}>Manage platform-wide master data and categorization.</p>
        </div>
        <button className={styles.addBtn} onClick={() => openModal()}>
          <Plus size={18} />
          <span>Add {ENTITY_TYPES.find(t => t.id === activeTab)?.label.slice(0, -1)}</span>
        </button>
      </header>

      <div className={styles.tabs}>
        {ENTITY_TYPES.map(type => (
          <button 
            key={type.id}
            className={`${styles.tab} ${activeTab === type.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by label or value..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <OrganizationListSkeleton />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Label</th>
                  {activeTab === 'role' && <th>Specializations</th>}
                  {activeTab === 'specialization' && <th>Hierarchy (Role)</th>}
                  <th>Value / Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.emptyCell}>
                      No entities found for this category.
                    </td>
                  </tr>
                ) : (
                  entities.map((entity) => (
                    <React.Fragment key={entity.id}>
                      <tr className={`${activeTab === 'role' ? styles.roleRow : ''} ${expandedRoles.has(entity.id) ? styles.expanded : ''}`}>
                        <td data-label="Label">
                          <div className={styles.labelCell}>
                            {activeTab === 'role' && entity.specializations?.length > 0 && (
                              <button 
                                className={styles.expandBtn} 
                                onClick={() => toggleExpand(entity.id)}
                              >
                                {expandedRoles.has(entity.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            )}
                            {entity.label}
                          </div>
                        </td>
                        {activeTab === 'role' && (
                          <td data-label="Specializations">
                            <div className={styles.specCountWrapper}>
                              <span className={styles.specCount}>
                                {entity.specializations?.length || 0} items
                              </span>
                              <button 
                                className={styles.quickAddBtn} 
                                onClick={() => openAddChildModal(entity)}
                                title="Add Specialization"
                              >
                                <PlusCircle size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                        {activeTab === 'specialization' && (
                          <td data-label="Hierarchy">
                            <div className={styles.hierarchyChain}>
                              <span className={styles.parentRole}>{entity.parent_label || 'Unassigned'}</span>
                              <span className={styles.chainArrow}>&gt;</span>
                              <span className={styles.childSpec}>{entity.label}</span>
                            </div>
                          </td>
                        )}
                        <td data-label="Value / Slug"><code>{entity.value}</code></td>
                        <td data-label="Order">{entity.sort_order}</td>
                        <td data-label="Status">
                          <span className={`${styles.statusBadge} ${entity.is_active ? styles.active : styles.inactive}`}>
                            {entity.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td data-label="Actions" className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button onClick={() => handleToggle(entity)} title={entity.is_active ? 'Disable' : 'Enable'}>
                              {entity.is_active ? <PowerOff size={16} /> : <Power size={16} className={styles.powerOn} />}
                            </button>
                            <button onClick={() => openModal(entity)} title="Edit">
                              <Edit2 size={16} className={styles.editIcon} />
                            </button>
                            <button onClick={() => handleDelete(entity.id)} title="Delete" className={styles.deleteBtn}>
                              <Trash2 size={16} className={styles.deleteIcon} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {activeTab === 'role' && expandedRoles.has(entity.id) && entity.specializations?.map((spec, idx) => (
                        <tr key={spec.id} className={`${styles.childRow} ${idx === entity.specializations.length - 1 ? styles.lastChild : ''}`}>
                          <td colSpan="6">
                            <div className={styles.childContent}>
                              <div className={styles.treeLine}>|_</div>
                              <div className={styles.childLabel}>{spec.label}</div>
                              <div className={styles.childValue}><code>{spec.value}</code></div>
                              <div className={styles.childStatus}>
                                <span className={`${styles.statusBadge} ${spec.is_active ? styles.active : styles.inactive}`}>
                                  {spec.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className={styles.childActions}>
                                <button onClick={() => handleToggle(spec)} title={spec.is_active ? 'Disable' : 'Enable'}>
                                  {spec.is_active ? <PowerOff size={14} /> : <Power size={14} className={styles.powerOn} />}
                                </button>
                                <button onClick={() => openModal({...spec, activeTab: 'specialization'})} title="Edit">
                                  <Edit2 size={14} className={styles.editIcon} />
                                </button>
                                <button onClick={() => handleDelete(spec.id)} title="Delete" className={styles.deleteBtn}>
                                  <Trash2 size={14} className={styles.deleteIcon} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingEntity ? `Edit ${activeTab}` : `Add New ${activeTab}`}
      >
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Label (Display Name)</label>
            <input 
              type="text" 
              placeholder="e.g. Cardiologist" 
              required 
              value={formData.label} 
              onChange={(e) => setFormData({...formData, label: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Value (Internal Slug)</label>
            <input 
              type="text" 
              placeholder="e.g. cardiologist (optional)" 
              value={formData.value} 
              onChange={(e) => setFormData({...formData, value: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Sort Order</label>
            <input 
              type="number" 
              value={formData.sort_order} 
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})} 
            />
          </div>
          {activeTab === 'specialization' && (
            <div className={styles.formGroup}>
              <label>Parent Role</label>
              <select 
                value={formData.parent_id}
                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                required
                className={styles.modalSelect}
              >
                <option value="">Select Parent Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className={styles.modalSubmit}>
              {editingEntity ? 'Save Changes' : 'Create Entity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>

  );
};

export default EntityManagement;
