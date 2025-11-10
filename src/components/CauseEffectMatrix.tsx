import { useState } from 'react';
import { supabase, IOPoint, CauseEffect } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

type CauseEffectMatrixProps = {
  projectId: string;
  ioPoints: IOPoint[];
  causeEffects: CauseEffect[];
  onUpdate: () => void;
};

export default function CauseEffectMatrix({
  projectId,
  ioPoints,
  causeEffects,
  onUpdate,
}: CauseEffectMatrixProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cause_id: '',
    effect_id: '',
    logic_type: 'AND',
    time_delay: 0,
    priority: 1,
    description: '',
  });

  const resetForm = () => {
    setFormData({
      cause_id: '',
      effect_id: '',
      logic_type: 'AND',
      time_delay: 0,
      priority: 1,
      description: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('cause_effect_matrix')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('cause_effect_matrix')
        .insert([{ ...formData, project_id: projectId }]);
    }

    resetForm();
    onUpdate();
  };

  const handleEdit = (ce: CauseEffect) => {
    setFormData({
      cause_id: ce.cause_id,
      effect_id: ce.effect_id,
      logic_type: ce.logic_type,
      time_delay: ce.time_delay,
      priority: ce.priority,
      description: ce.description,
    });
    setEditingId(ce.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cause-effect relationship?')) return;
    await supabase.from('cause_effect_matrix').delete().eq('id', id);
    onUpdate();
  };

  const getIOPointById = (id: string) => {
    return ioPoints.find((io) => io.id === id);
  };

  const inputPoints = ioPoints.filter(
    (io) => io.io_type === 'DI' || io.io_type === 'AI'
  );
  const outputPoints = ioPoints.filter(
    (io) => io.io_type === 'DO' || io.io_type === 'AO'
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Cause & Effect Matrix
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Define logic relationships between inputs and outputs
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Relationship
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Relationship' : 'New Relationship'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cause (Input)
                </label>
                <select
                  value={formData.cause_id}
                  onChange={(e) =>
                    setFormData({ ...formData, cause_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select input...</option>
                  {inputPoints.map((io) => (
                    <option key={io.id} value={io.id}>
                      {io.tag_name} - {io.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Effect (Output)
                </label>
                <select
                  value={formData.effect_id}
                  onChange={(e) =>
                    setFormData({ ...formData, effect_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select output...</option>
                  {outputPoints.map((io) => (
                    <option key={io.id} value={io.id}>
                      {io.tag_name} - {io.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Logic Type
                </label>
                <select
                  value={formData.logic_type}
                  onChange={(e) =>
                    setFormData({ ...formData, logic_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                  <option value="NOT">NOT</option>
                  <option value="DIRECT">DIRECT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time Delay (seconds)
                </label>
                <input
                  type="number"
                  value={formData.time_delay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_delay: parseFloat(e.target.value),
                    })
                  }
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Describe the control logic..."
              />
            </div>

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

      {ioPoints.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            Please add I/O points first before creating cause-effect
            relationships.
          </p>
        </div>
      )}

      {inputPoints.length === 0 && ioPoints.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            No input points (DI/AI) found. Add inputs to create cause-effect
            relationships.
          </p>
        </div>
      )}

      {outputPoints.length === 0 && ioPoints.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            No output points (DO/AO) found. Add outputs to create cause-effect
            relationships.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Cause (Input)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Logic
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Effect (Output)
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Delay
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Description
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {causeEffects.map((ce) => {
              const cause = getIOPointById(ce.cause_id);
              const effect = getIOPointById(ce.effect_id);
              return (
                <tr key={ce.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-mono text-slate-900">
                      {cause?.tag_name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {cause?.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {ce.logic_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-mono text-slate-900">
                      {effect?.tag_name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {effect?.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">
                    {ce.time_delay > 0 ? `${ce.time_delay}s` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ce.priority === 1
                          ? 'bg-red-100 text-red-700'
                          : ce.priority === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      P{ce.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {ce.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(ce)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ce.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {causeEffects.length === 0 && ioPoints.length > 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No cause-effect relationships yet</p>
            <p className="text-sm mt-2">
              Add your first relationship to define control logic
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
