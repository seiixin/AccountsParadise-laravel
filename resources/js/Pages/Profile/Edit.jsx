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
      let isFormData = false;

      if (field === 'name') payload = { name };
      if (field === 'username') payload = { username };
      if (field === 'email') payload = { email };

      if (field === 'avatar') {
        isFormData = true;
        payload = new FormData();
        payload.append('_method', 'PATCH');

        if (avatarBlob) {
          const file = new File([avatarBlob], 'avatar.png', { type: 'image/png' });
          payload.append('avatar', file);
        } else if (avatar) {
          payload.append('avatar', avatar);
        }
      }

      const res = await axios({
        method: isFormData ? 'post' : 'patch',
        url: '/profile',
        data: payload,
        headers: { Accept: 'application/json' },
        withCredentials: true,
      });

      if (res.data?.user) setViewUser(res.data.user);

      setNameEdit(false);
      setUsernameEdit(false);
      setEmailEdit(false);
      setAvatarEdit(false);
      setAvatar(null);
      setAvatarBlob(null);

      setMessage(res.data?.message ?? 'Saved');
    } catch {
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  }

  const role = user?.role;
  const Layout =
    role === 'admin'
      ? AdminLayout
      : role === 'merchant'
      ? MerchantLayout
      : role === 'buyer'
      ? BuyerLayout
      : GuestLayout;

  const layoutProps =
    Layout === GuestLayout
      ? {}
      : { title: 'Profile', header: <h2 className="text-xl font-semibold">Profile Settings</h2> };

  return (
    <Layout {...layoutProps}>
      {Layout === GuestLayout ? <Head title="Profile" /> : null}

      <div className="mx-auto max-w-5xl px-0 sm:px-4 py-6 space-y-6">

        {/* ACCOUNT SECTION */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-6">

          {/* AVATAR */}
          <div className="text-center sm:text-left">
            <div className="text-xs text-neutral-400">Profile Picture</div>

            <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-neutral-800 overflow-hidden mx-auto sm:mx-0">
                {viewUser.avatar_path && (
                  <img
                    src={`/storage/${viewUser.avatar_path}?t=${Date.now()}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="w-full sm:w-auto">
                {!avatarEdit ? (
                  <button
                    onClick={() => {
                      setAvatarEdit(true);
                      fileInputRef.current?.click();
                    }}
                    className="rounded border border-neutral-700 px-4 py-2 w-full sm:w-auto"
                  >
                    Change Avatar
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                      className="w-full"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => saveField('avatar')}
                        className="rounded bg-blue-600 px-4 py-2 text-white w-full sm:w-auto"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setAvatarEdit(false)}
                        className="rounded bg-neutral-800 px-4 py-2 w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NAME */}
          <EditableField
            label="Name"
            value={viewUser.name}
            editing={nameEdit}
            setEditing={setNameEdit}
            inputValue={name}
            setInputValue={setName}
            onSave={() => saveField('name')}
            saving={saving}
          />

          {/* USERNAME */}
          <EditableField
            label="Username"
            value={viewUser.username}
            editing={usernameEdit}
            setEditing={setUsernameEdit}
            inputValue={username}
            setInputValue={setUsername}
            onSave={() => saveField('username')}
            saving={saving}
          />

          {/* EMAIL */}
          <EditableField
            label="Email"
            value={viewUser.email}
            editing={emailEdit}
            setEditing={setEmailEdit}
            inputValue={email}
            setInputValue={setEmail}
            onSave={() => saveField('email')}
            saving={saving}
          />

          {message && (
            <div className="text-sm text-neutral-400">{message}</div>
          )}
        </div>

        {/* SECURITY + INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="text-sm text-neutral-400 mb-3">Security</div>
            <UpdatePasswordForm />
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="text-sm text-neutral-400 mb-3">Account Info</div>

            <div className="space-y-2 text-sm">
              <InfoRow label="Role" value={viewUser.role} />
              <InfoRow label="User ID" value={viewUser.id} mono />
              <InfoRow label="Created" value={viewUser.created_at} mono />
              <InfoRow label="Updated" value={viewUser.updated_at} mono />
            </div>
          </div>

        </div>

        {/* DANGER ZONE */}
        <div className="rounded-lg border border-red-900 bg-neutral-950 p-4">
          <div className="text-sm text-red-500 mb-3">Danger Zone</div>
          <DeleteUserForm />
        </div>

        <AvatarCropper
          src={avatarSrc}
          open={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
        />
      </div>
    </Layout>
  );
}

/* ---------- Small Reusable Components ---------- */

function EditableField({
  label,
  value,
  editing,
  setEditing,
  inputValue,
  setInputValue,
  onSave,
  saving,
}) {
  return (
    <div>
      <div className="text-xs text-neutral-400">{label}</div>

      {!editing ? (
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="font-medium">{value}</div>
          <button
            onClick={() => setEditing(true)}
            className="rounded border border-neutral-700 px-3 py-2 w-full sm:w-auto"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 w-full"
          />
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white w-full sm:w-auto"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded bg-neutral-800 px-4 py-2 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between">
      <div className="text-neutral-400">{label}</div>
      <div className={mono ? 'font-mono' : 'font-medium'}>
        {value}
      </div>
    </div>
  );
}
