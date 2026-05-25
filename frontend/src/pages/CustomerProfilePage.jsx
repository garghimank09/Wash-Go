import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { customerProfileService } from '../services/customerProfileService';
import { mediaUrl } from '../lib/mediaUrl';
import { getErrorMessage } from '../services/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../lib/cn';

export function CustomerProfilePage() {
  const { refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerProfileService.get();
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAvatarUrl(mediaUrl(data.avatar_url));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onPickPhoto = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(true);
    try {
      const data = await customerProfileService.uploadAvatar(file);
      setAvatarUrl(mediaUrl(data.avatar_url));
      await refreshUser();
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const data = await customerProfileService.update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
      setAvatarUrl(mediaUrl(data.avatar_url));
      await refreshUser();
      toast.success('Profile saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-cyan-600 dark:text-cyan-400" aria-hidden />
        <span className="sr-only">Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-wg-text">Your profile</h1>
        <p className="mt-1 text-sm text-wg-muted">Update your name, phone, and profile photo.</p>
      </div>

      <Card className="overflow-hidden p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={onPickPhoto}
            disabled={uploading}
            className={cn(
              'group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 transition hover:border-cyan-500/60 wg-focus-ring',
              uploading && 'opacity-60',
            )}
            aria-label="Change profile photo"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <User className="size-10 text-cyan-600/70 dark:text-cyan-300/80" strokeWidth={1.5} aria-hidden />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-white" aria-hidden />
              ) : (
                <Camera className="size-6 text-white" strokeWidth={1.75} aria-hidden />
              )}
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-wg-text">{fullName || 'Member'}</p>
            <p className="truncate text-xs text-wg-muted">{email}</p>
            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onPickPhoto} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Change photo'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Full name" name="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
          />
          <Input label="Email" name="email" value={email} disabled className="opacity-70" />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
