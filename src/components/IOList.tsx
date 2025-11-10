import { useState } from 'react';
import { supabase, IOPoint } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, Upload } from 'lucide-react';

type IOListProps = {
  projectId: string;
  ioPoints: IOPoint[];
  onUpdate: () => void;
};

export default function IOList({ projectId, ioPoints, onUpdate }: IOListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tag_name: '',
    description: '',
    io_type: 'DI' as 'DI' | 'DO' | 'AI' | 'AO',
    address: '',
    modbus_register: '',
    normal_state: '',
    engineering_units: '',
    range_min: 0,
    range_max: 100,
  });

  const resetForm = () => {
    setFormData({
      tag_name: '',
      description: '',
      io_type: 'DI',
      address: '',
      modbus_register: '',
      normal_state: '',
      engineering_units: '',
      range_min: 0,
      range_max: 100,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('io_points')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('io_points')
        .insert([{ ...formData, project_id: projectId }]);
    }

    resetForm();
    onUpdate();
  };

  const handleEdit = (io: IOPoint) => {
    setFormData({
      tag_name: io.tag_name,
      description: io.description,
      io_type: io.io_type,
      address: io.address,
      modbus_register: io.modbus_register,
      normal_state: io.normal_state,
      engineering_units: io.engineering_units,
      range_min: io.range_min,
      range_max: io.range_max,
    });
    setEditingId(io.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this I/O point?')) return;
    await supabase.from('io_points').delete().eq('id', id);
    onUpdate();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { importIOPointsFromFile } = await import('../lib/fileImportUtils');
    const result = await importIOPointsFromFile(file, projectId);

    if (result.success) {
      alert(`Successfully imported ${result.count} I/O points`);
      onUpdate();
    } else {
      alert(`Import failed: ${result.error}`);
    }

    e.target.value = '';
  };

  const isAnalog = formData.io_type === 'AI' || formData.io_type === 'AO';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">I/O Points</h2>
        <div className="flex gap-2">
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Upload size={18} />
            Import CSV
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add I/O Point
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit I/O Point' : 'New I/O Point'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={formData.tag_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tag_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  I/O Type
                </label>
                <select
                  value={formData.io_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      io_type: e.target.value as 'DI' | 'DO' | 'AI' | 'AO',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DI">Digital Input (DI)</option>
                  <option value="DO">Digital Output (DO)</option>
                  <option value="AI">Analog Input (AI)</option>
                  <option value="AO">Analog Output (AO)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PLC Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g., I0.0, Q0.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Modbus Register
                </label>
                <input
                  type="text"
                  value={formData.modbus_register}
                  onChange={(e) =>
                    setFormData({ ...formData, modbus_register: e.target.value })
                  }
                  placeholder="e.g., 40001, 30001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {!isAnalog && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Normal State
                  </label>
                  <select
                    value={formData.normal_state}
                    onChange={(e) =>
                      setFormData({ ...formData, normal_state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-</option>
                    <option value="Normally Open">Normally Open</option>
                    <option value="Normally Closed">Normally Closed</option>
                  </select>
                </div>
              </div>
            )}

            {isAnalog && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Engineering Units
                  </label>
                  <input
                    type="text"
                    value={formData.engineering_units}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineering_units: e.target.value,
                      })
                    }
                    placeholder="e.g., °C, bar, m³/h"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Range
                  </label>
                  <input
                    type="number"
                    value={formData.range_min}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        range_min: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Range
                  </label>
                  <input
                    type="number"
                    value={formData.range_max}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        range_max: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={18} />
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Tag
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Description
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                PLC Address
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Modbus Reg
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Details
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {ioPoints.map((io) => (
              <tr key={io.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-mono text-slate-900">
                  {io.tag_name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {io.description}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      io.io_type === 'DI'
                        ? 'bg-blue-100 text-blue-700'
                        : io.io_type === 'DO'
                        ? 'bg-green-100 text-green-700'
                        : io.io_type === 'AI'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {io.io_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {io.address}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {io.modbus_register}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {io.io_type === 'AI' || io.io_type === 'AO'
                    ? `${io.range_min}-${io.range_max} ${io.engineering_units}`
                    : io.normal_state}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(io)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(io.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ioPoints.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No I/O points yet</p>
            <p className="text-sm mt-2">Add your first I/O point to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
