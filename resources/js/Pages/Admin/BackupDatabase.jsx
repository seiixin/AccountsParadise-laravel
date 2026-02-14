import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import axios from 'axios';

export default function BackupDatabase() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState('');

    async function runBackup() {
        setStatus('Running backup...');
        try {
            const res = await axios.post('/admin/backup', {}, { headers: { Accept: 'application/json' } });
            setStatus(res.data?.message ?? 'Backup triggered.');
        } catch (e) {
            setStatus('Backup endpoint not available. Please add /admin/backup.');
        } finally {
            setOpen(false);
        }
    }

    return (
        <AdminLayout title="Admin · Backup" header={<h2 className="text-xl font-semibold">Backup Database</h2>}>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                <div className="mb-2 text-neutral-400">Create a backup of the database for archiving or migration.</div>
                <button onClick={() => setOpen(true)} className="rounded bg-blue-600 px-3 py-2 text-white">Run Backup</button>
                <div className="mt-3 text-sm text-neutral-400">{status}</div>
            </div>

            <div className={`${open ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center bg-black/50`}>
                <div className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-3 text-lg font-semibold">Confirm Backup</div>
                    <p className="text-sm text-neutral-400">This will run the backup process. Continue?</p>
                    <div className="mt-3 flex items-center gap-2">
                        <button onClick={runBackup} className="rounded bg-blue-600 px-3 py-2 text-white">Confirm</button>
                        <button onClick={() => setOpen(false)} className="rounded bg-neutral-800 px-3 py-2">Cancel</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
