import React, { useEffect, useState } from 'react';
import * as adminService from '../../api/adminService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .getSettings()
      .then(({ data }) => setSettings(data.data || {}))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminService.updateSettings(settings);
      alert('Settings saved');
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader className="mx-auto mt-20" />;

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} noValidate>
        {/* Example setting input */}
        <Input
          id="exampleSetting"
          name="exampleSetting"
          label="Example Setting"
          value={settings.exampleSetting || ''}
          onChange={handleChange}
          placeholder="Value"
          // Add error handling if implemented
        />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
      </form>
    </main>
  );
};

export default Settings;
