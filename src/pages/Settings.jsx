import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSessionUser } from '../features/auth/authSlice';
import {
  Save,
  User,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { SettingsSkeleton, SkeletonBlock } from '../components/Skeleton';
import styles from './Settings.module.css';

function formatRoleLabel(role) {
  if (!role) return '';
  return String(role)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(true);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    roleLabel: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role: 'admin',
    password: '',
  });

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await apiClient.get('/admin/me');
      const a = res.data?.data;
      if (a) {
        setProfile({
          fullName: a.full_name || '',
          email: a.email || '',
          roleLabel: formatRoleLabel(a.role),
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
      setProfile({
        fullName: user?.full_name || user?.name || '',
        email: user?.email || '',
        roleLabel: formatRoleLabel(user?.role),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const uid = user?.id;
    if (!uid) {
      toast.error('Not logged in');
      return;
    }

    const payload = {
      full_name: profile.fullName,
      email: profile.email,
    };

    const np = newPassword.trim();
    const cp = confirmPassword.trim();
    if (np || cp) {
      if (!np || !cp) {
        toast.error('Enter new password in both fields to change it');
        return;
      }
      if (np !== cp) {
        toast.error('Passwords do not match');
        return;
      }
      if (np.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      payload.password = np;
    }

    try {
      const res = await apiClient.patch(`/admin/admins/${uid}`, payload);
      const u = res.data?.data;
      if (u) {
        dispatch(
          updateSessionUser({
            full_name: u.full_name,
            email: u.email,
            role: u.role,
          })
        );
      }
      toast.success(payload.password ? 'Profile and password updated' : 'Profile updated');
      setNewPassword('');
      setConfirmPassword('');
      await fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    }
  };

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const res = await apiClient.get('/admin/admins');
      setAdmins(res.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admins');
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);

  const activeAdminCount = admins.length;
  const maxAdminsReached = activeAdminCount >= 5;

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.full_name || !adminForm.email || !adminForm.password) {
      toast.error('Please fill full name, email and password');
      return;
    }
    if (maxAdminsReached) {
      toast.error('Maximum 5 active admins allowed');
      return;
    }
    setAdminSubmitting(true);
    try {
      await apiClient.post('/admin/admins', adminForm);
      toast.success('Admin added successfully');
      setAdminForm({ full_name: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const startEdit = (admin) => {
    setEditingAdminId(admin.id);
    setEditForm({
      full_name: admin.full_name || '',
      email: admin.email || '',
      role: admin.role || 'admin',
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditingAdminId(null);
    setEditForm({ full_name: '', email: '', role: 'admin', password: '' });
  };

  const submitEdit = async (adminId) => {
    const payload = {
      full_name: editForm.full_name,
      email: editForm.email,
      role: editForm.role,
    };
    if (String(editForm.password || '').trim()) {
      payload.password = editForm.password;
    }
    setAdminSubmitting(true);
    try {
      await apiClient.patch(`/admin/admins/${adminId}`, payload);
      toast.success('Admin updated');
      cancelEdit();
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const removeAdmin = async (admin) => {
    if (!admin.can_delete) {
      toast.error('First created admin cannot be deleted');
      return;
    }
    const ok = window.confirm(`Delete admin ${admin.full_name}?`);
    if (!ok) return;

    setAdminSubmitting(true);
    try {
      await apiClient.delete(`/admin/admins/${admin.id}`);
      toast.success('Admin removed');
      if (editingAdminId === admin.id) cancelEdit();
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setAdminSubmitting(false);
    }
  };

  if (profileLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings & Profile</h1>
        {activeTab === 'profile' && (
          <button type="button" className={styles.saveBtn} onClick={handleSave}>
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        )}
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <SlidersHorizontal size={14} />
          Profile Settings
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'admins' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <Users size={14} />
          Admins ({activeAdminCount})
        </button>
      </div>

      <div className={styles.grid}>
        {activeTab === 'profile' && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <User size={18} />
              </div>
              <h2>My Profile</h2>
            </div>
            <form className={styles.formGrid} onSubmit={handleSave}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  value={profile.fullName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@staffton.com"
                />
              </div>
              <div className={styles.field}>
                <label>Primary Role</label>
                <input value={profile.roleLabel} readOnly />
              </div>
              <div className={styles.field}>
                <label>New Password <span className={styles.optional}>(optional)</span></label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set a new password"
                />
              </div>
              <div className={styles.field}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>
            </form>
          </section>
        )}

        {activeTab === 'admins' && (
          <div className={styles.adminsPanel}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Plus size={18} />
                </div>
                <h2>Register New Admin</h2>
              </div>
              <form className={styles.formGrid} onSubmit={handleAddAdmin}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input
                    value={adminForm.full_name}
                    onChange={(e) => setAdminForm((p) => ({ ...p, full_name: e.target.value }))}
                    disabled={adminSubmitting || maxAdminsReached}
                    placeholder="Admin name"
                  />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
                    disabled={adminSubmitting || maxAdminsReached}
                    placeholder="email@staffton.com"
                  />
                </div>
                <div className={styles.field}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
                    disabled={adminSubmitting || maxAdminsReached}
                    placeholder="••••••••"
                  />
                </div>
                <div className={styles.field}>
                  <label>Role</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm((p) => ({ ...p, role: e.target.value }))}
                    disabled={adminSubmitting || maxAdminsReached}
                  >
                    <option value="admin">Admin Access</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={adminSubmitting || maxAdminsReached}
                  >
                    Register Admin
                  </button>
                </div>
              </form>
              <p className={styles.adminHint}>
                {activeAdminCount}/5 active seats
                {maxAdminsReached ? ' (Limit reached)' : ''}
              </p>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <ShieldAlert size={18} />
                </div>
                <h2>Active Administrators</h2>
              </div>

              {adminsLoading ? (
                <div className={styles.listEmpty}>Syncing admins...</div>
              ) : admins.length === 0 ? (
                <div className={styles.listEmpty}>No secondary administrators found.</div>
              ) : (
                <div className={styles.adminList}>
                  {admins.map((admin) => (
                    <article key={admin.id} className={styles.adminItem}>
                      {editingAdminId === admin.id ? (
                        <div style={{ width: '100%' }}>
                          <div className={styles.adminEditGrid}>
                            <input
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, full_name: e.target.value }))
                              }
                              placeholder="Full name"
                            />
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, email: e.target.value }))
                              }
                              placeholder="Email"
                            />
                            <select
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, role: e.target.value }))
                              }
                            >
                              <option value="admin">admin</option>
                              <option value="super_admin">super_admin</option>
                            </select>
                            <input
                              type="password"
                              value={editForm.password}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, password: e.target.value }))
                              }
                              placeholder="New password (optional)"
                            />
                          </div>
                          <div className={styles.adminActions}>
                            <button
                              type="button"
                              className={styles.saveBtn}
                              disabled={adminSubmitting}
                              onClick={() => submitEdit(admin.id)}
                            >
                              Save Changes
                            </button>
                            <button type="button" className={styles.ghostBtn} onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.adminMeta}>
                            <h4>{admin.full_name}</h4>
                            <p>{admin.email}</p>
                            <span className={styles.rolePill}>{admin.role}</span>
                            {admin.is_primary_admin && (
                              <span className={styles.primaryPill}>Primary</span>
                            )}
                          </div>
                          <div className={styles.adminActions}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => startEdit(admin)}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            {admin.can_delete && (
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.dangerBtn}`}
                                onClick={() => removeAdmin(admin)}
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>

  );
};

export default Settings;
