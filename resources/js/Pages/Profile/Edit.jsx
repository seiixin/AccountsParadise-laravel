import { Head, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import AvatarCropper from '@/Components/Guest/AvatarCropper';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import AdminLayout from '@/Layouts/AdminLayout';
import BuyerLayout from '@/Layouts/BuyerLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import MerchantLayout from '@/Layouts/MerchantLayout';

export default function Edit() {
  const { auth } = usePage().props;
  const user = auth?.user ?? {};
  const [viewUser, setViewUser] = useState(user);

  const [nameEdit, setNameEdit] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [avatarEdit, setAvatarEdit] = useState(false);

  const [name, setName] = useState(viewUser.name ?? '');
  const [username, setUsername] = useState(viewUser.username ?? '');
  const [email, setEmail] = useState(viewUser.email ?? '');
  const [avatar, setAvatar] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  async function saveField(field) {
    setSaving(true);
    setMessage('');
    try {
      let payload;
      let headers = { Accept: 'application/json' };
      let isFormData = false;
      if (field === 'name') {
        payload = { name };
      } else if (field === 'username') {
        payload = { username };
      } else if (field === 'email') {
        payload = { email };
      } else if (field === 'avatar') {
        isFormData = true;
        payload = new FormData();
        payload.append('_method', 'PATCH');
        if (avatarBlob) {
          const file = new File([avatarBlob], 'avatar.png', { type: 'image/png' });
          payload.append('avatar', file);
          const dataUrl = await new Promise((resolve) => {
            const fr = new FileReader();
            fr.onloadend = () => resolve(fr.result);
            fr.readAsDataURL(file);
          });
          payload.append('avatar_base64', dataUrl);
        } else if (avatar) {
          payload.append('avatar', avatar);
        }
      }
      const res = await axios({
        method: isFormData ? 'post' : 'patch',
        url: '/profile',
        data: payload,
        headers: isFormData ? { ...headers } : headers,
        withCredentials: true,
      });
      setMessage(res.data?.message ?? 'Saved');
      if (res.data?.user) {
        setViewUser(res.data.user);
      }
      setNameEdit(false);
      setUsernameEdit(false);
      setEmailEdit(false);
      setAvatarEdit(false);
      setAvatarBlob(null);
      setAvatar(null);
    } catch (e) {
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  }

  return (
    (() => {
      const role = user?.role;
      const Layout = role === 'admin'
        ? AdminLayout
        : role === 'merchant'
        ? MerchantLayout
        : role === 'buyer'
        ? BuyerLayout
        : GuestLayout;
      const layoutProps = Layout === GuestLayout
        ? {}
        : { title: 'Profile', header: <h2 className="text-xl font-semibold">Profile Settings</h2> };
      return (
        <Layout {...layoutProps}>
      {Layout === GuestLayout ? <Head title="Profile" /> : null}
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="glass-soft rounded-lg p-4">
          <div className="text-sm text-neutral-400">Account</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded border border-neutral-800 p-3">
              <div className="text-xs text-neutral-400">Profile Picture</div>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-neutral-800 overflow-hidden">
                  {avatarBlob ? (
                    <img src={URL.createObjectURL(avatarBlob)} alt="avatar" className="h-full w-full object-cover" />
                  ) : avatarSrc ? (
                    <img src={avatarSrc} alt="avatar-preview" className="h-full w-full object-cover" />
                  ) : viewUser.avatar_path ? (
                    <img src={`/storage/${viewUser.avatar_path}?t=${Date.now()}`} alt="avatar" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                {!avatarEdit ? (
                  <button
                    onClick={() => {
                      setAvatarEdit(true);
                      const el = fileInputRef.current;
                      if (el) el.click();
                    }}
                    className="rounded glass-soft px-3 py-2"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setAvatar(file);
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setAvatarSrc(url);
                          setAvatarModalOpen(true);
                        }
                      }}
                      className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full sm:w-auto"
                    />
                    <button onClick={() => saveField('avatar')} className="rounded bg-blue-600 px-3 py-2 text-white w-full sm:w-auto" disabled={saving}>Save</button>
                    <button onClick={() => { setAvatarEdit(false); setAvatar(null); }} className="rounded bg-neutral-800 px-3 py-2 w-full sm:w-auto">Cancel</button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded border border-neutral-800 p-3">
              <div className="text-xs text-neutral-400">Name</div>
              {!nameEdit ? (
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-medium">{viewUser.name}</div>
                  <button onClick={() => setNameEdit(true)} className="rounded glass-soft px-3 py-2">Edit</button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full sm:flex-1" />
                  <button onClick={() => saveField('name')} className="rounded bg-blue-600 px-3 py-2 text-white w-full sm:w-auto" disabled={saving}>Save</button>
                  <button onClick={() => { setName(viewUser.name ?? ''); setNameEdit(false); }} className="rounded bg-neutral-800 px-3 py-2 w-full sm:w-auto">Cancel</button>
                </div>
              )}
            </div>

            <div className="rounded border border-neutral-800 p-3">
              <div className="text-xs text-neutral-400">Username</div>
              {!usernameEdit ? (
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-medium">{viewUser.username}</div>
                  <button onClick={() => setUsernameEdit(true)} className="rounded glass-soft px-3 py-2">Edit</button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full sm:flex-1" />
                  <button onClick={() => saveField('username')} className="rounded bg-blue-600 px-3 py-2 text-white w-full sm:w-auto" disabled={saving}>Save</button>
                  <button onClick={() => { setUsername(viewUser.username ?? ''); setUsernameEdit(false); }} className="rounded bg-neutral-800 px-3 py-2 w-full sm:w-auto">Cancel</button>
                </div>
              )}
            </div>

            <div className="rounded border border-neutral-800 p-3">
              <div className="text-xs text-neutral-400">Email</div>
              {!emailEdit ? (
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-medium">{viewUser.email}</div>
                  <button onClick={() => setEmailEdit(true)} className="rounded glass-soft px-3 py-2">Edit</button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full sm:flex-1" />
                  <button onClick={() => saveField('email')} className="rounded bg-blue-600 px-3 py-2 text-white w-full sm:w-auto" disabled={saving}>Save</button>
                  <button onClick={() => { setEmail(viewUser.email ?? ''); setEmailEdit(false); }} className="rounded bg-neutral-800 px-3 py-2 w-full sm:w-auto">Cancel</button>
                </div>
              )}
            </div>
          </div>
          {message && <div className="mt-3 text-sm text-neutral-400">{message}</div>}
        </div>
        <AvatarCropper
          src={avatarSrc}
          open={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-soft rounded-lg p-4">
            <div className="text-sm text-neutral-400">Security</div>
            <div className="mt-2">
              <UpdatePasswordForm />
            </div>
          </div>
          <div className="glass-soft rounded-lg p-4">
            <div className="text-sm text-neutral-400">Account Info</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="text-neutral-400">Role</div><div className="font-medium">{viewUser.role}</div>
              <div className="text-neutral-400">User ID</div><div className="font-mono">{viewUser.id}</div>
              <div className="text-neutral-400">Created</div><div className="font-mono">{viewUser.created_at}</div>
              <div className="text-neutral-400">Updated</div><div className="font-mono">{viewUser.updated_at}</div>
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-lg p-4">
          <div className="text-sm text-neutral-400">Danger Zone</div>
          <div className="mt-2">
            <DeleteUserForm />
          </div>
        </div>
      </div>
        </Layout>
      );
    })()
  );
}
