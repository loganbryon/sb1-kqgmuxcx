import { useState } from 'react';
import { supabase, ModbusRegisterMap } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

type ModbusRegisterMapProps = {
  projectId: string;
  registerMaps: ModbusRegisterMap[];
  onUpdate: () => void;
};

const COMM_PORTS = [
  'Local Port',
  'Com 1 - RS-232',
  'Com 2 - RS-485',
  'Com 3 - RS-485',
  'Com 4 - RS-485',
  'Com 5 - RS-485',
];

export default function ModbusRegisterMapComponent({
  projectId,
  registerMaps,
  onUpdate,
}: ModbusRegisterMapProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    table_number: 0,
    index_number: 0,
    start_register: 0,
    end_register: 0,
    device_parameter: '',
    indexing_type: 'Point' as 'Point' | 'Parameter',
    conversion_code: 0,
    comm_port: 'Local Port',
  });

  const resetForm = () => {
    setFormData({
      table_number: 0,
      index_number: 0,
      start_register: 0,
      end_register: 0,
      device_parameter: '',
      indexing_type: 'Point',
      conversion_code: 0,
      comm_port: 'Local Port',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('modbus_register_map')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('modbus_register_map')
        .insert([{ ...formData, project_id: projectId }]);
    }

    resetForm();
    onUpdate();
  };

  const handleEdit = (map: ModbusRegisterMap) => {
    setFormData({
      table_number: map.table_number,
      index_number: map.index_number,
      start_register: map.start_register,
      end_register: map.end_register,
      device_parameter: map.device_parameter,
      indexing_type: map.indexing_type,
      conversion_code: map.conversion_code,
      comm_port: map.comm_port,
    });
    setEditingId(map.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this register mapping?')) return;
    await supabase.from('modbus_register_map').delete().eq('id', id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Modbus Register Map
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure RS-485 Modbus communication between controller and field devices
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Register Map
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Register Map' : 'New Register Map'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Table #
                </label>
                <input
                  type="number"
                  value={formData.table_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      table_number: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Index #
                </label>
                <input
                  type="number"
                  value={formData.index_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      index_number: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Register
                </label>
                <input
                  type="number"
                  value={formData.start_register}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_register: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Register
                </label>
                <input
                  type="number"
                  value={formData.end_register}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      end_register: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Device Parameter
              </label>
              <input
                type="text"
                value={formData.device_parameter}
                onChange={(e) =>
                  setFormData({ ...formData, device_parameter: e.target.value })
                }
                placeholder="e.g., Flow Rate, Pressure, Temperature"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Indexing Type
                </label>
                <select
                  value={formData.indexing_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indexing_type: e.target.value as 'Point' | 'Parameter',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Point">Point</option>
                  <option value="Parameter">Parameter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Conversion Code (0-85)
                </label>
                <input
                  type="number"
                  min="0"
                  max="85"
                  value={formData.conversion_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conversion_code: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comm Port
                </label>
                <select
                  value={formData.comm_port}
                  onChange={(e) =>
                    setFormData({ ...formData, comm_port: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {COMM_PORTS.map((port) => (
                    <option key={port} value={port}>
                      {port}
                    </option>
                  ))}
                </select>
              </div>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Modbus Optimization Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Group consecutive registers together to minimize read/write operations</li>
          <li>• Use appropriate function codes: FC03 for holding registers, FC04 for input registers</li>
          <li>• Keep register blocks within 125 words for optimal performance</li>
          <li>• Implement proper error handling and timeout mechanisms</li>
          <li>• Consider using broadcast address (0) for write operations to multiple slaves</li>
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Table #
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Index #
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Start Reg
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                End Reg
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Device Parameter
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Conv Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Comm Port
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {registerMaps.map((map) => (
              <tr key={map.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900">{map.table_number}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{map.index_number}</td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {map.start_register}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {map.end_register}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {map.device_parameter}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {map.indexing_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {map.conversion_code}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{map.comm_port}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(map)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(map.id)}
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

        {registerMaps.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No register mappings yet</p>
            <p className="text-sm mt-2">Add your first register map to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
