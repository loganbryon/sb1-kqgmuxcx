import { useState } from 'react';
import { supabase, CommPortSettings } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

type CommPortSettingsProps = {
  projectId: string;
  commSettings: CommPortSettings[];
  onUpdate: () => void;
};

const COMM_TYPES = ['RS-232', 'RS-485', 'RS-422', 'Ethernet', 'Fiber Optic'];
const BAUD_RATES = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
const PARITY_OPTIONS = ['None', 'Even', 'Odd', 'Mark', 'Space'];
const DATA_BITS = [7, 8];
const STOP_BITS = [1, 2];

export default function CommPortSettingsComponent({
  projectId,
  commSettings,
  onUpdate,
}: CommPortSettingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    port_name: '',
    comm_type: 'RS-485',
    baud_rate: 9600,
    parity: 'None',
    data_bits: 8,
    stop_bits: 1,
    port_owner: '',
  });

  const resetForm = () => {
    setFormData({
      port_name: '',
      comm_type: 'RS-485',
      baud_rate: 9600,
      parity: 'None',
      data_bits: 8,
      stop_bits: 1,
      port_owner: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('comm_port_settings')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('comm_port_settings')
        .insert([{ ...formData, project_id: projectId }]);
    }

    resetForm();
    onUpdate();
  };

  const handleEdit = (setting: CommPortSettings) => {
    setFormData({
      port_name: setting.port_name,
      comm_type: setting.comm_type,
      baud_rate: setting.baud_rate,
      parity: setting.parity,
      data_bits: setting.data_bits,
      stop_bits: setting.stop_bits,
      port_owner: setting.port_owner,
    });
    setEditingId(setting.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comm port setting?')) return;
    await supabase.from('comm_port_settings').delete().eq('id', id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Communication Port Settings
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure serial and network communication parameters for each port
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Port Settings
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Port Settings' : 'New Port Settings'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Port Name
                </label>
                <input
                  type="text"
                  value={formData.port_name}
                  onChange={(e) =>
                    setFormData({ ...formData, port_name: e.target.value })
                  }
                  placeholder="e.g., COM1, COM2, Local Port"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Communication Type
                </label>
                <select
                  value={formData.comm_type}
                  onChange={(e) =>
                    setFormData({ ...formData, comm_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {COMM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Baud Rate
                </label>
                <select
                  value={formData.baud_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baud_rate: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {BAUD_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parity
                </label>
                <select
                  value={formData.parity}
                  onChange={(e) =>
                    setFormData({ ...formData, parity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PARITY_OPTIONS.map((parity) => (
                    <option key={parity} value={parity}>
                      {parity}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Bits
                </label>
                <select
                  value={formData.data_bits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_bits: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DATA_BITS.map((bits) => (
                    <option key={bits} value={bits}>
                      {bits}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stop Bits
                </label>
                <select
                  value={formData.stop_bits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stop_bits: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STOP_BITS.map((bits) => (
                    <option key={bits} value={bits}>
                      {bits}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Port Owner / Device
              </label>
              <input
                type="text"
                value={formData.port_owner}
                onChange={(e) =>
                  setFormData({ ...formData, port_owner: e.target.value })
                }
                placeholder="e.g., Modbus Master, HMI, Data Logger"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-green-900 mb-2">
          Common Serial Communication Settings:
        </h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• <strong>RS-485 Standard:</strong> 9600 baud, 8 data bits, No parity, 1 stop bit</li>
          <li>• <strong>RS-232 Standard:</strong> 9600 baud, 8 data bits, No parity, 1 stop bit</li>
          <li>• <strong>High-Speed:</strong> 115200 baud, 8 data bits, No parity, 1 stop bit</li>
          <li>• <strong>Legacy Systems:</strong> 4800 baud, 7 data bits, Even parity, 1 stop bit</li>
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Port Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Comm Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Baud Rate
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Parity
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Data/Stop Bits
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Port Owner
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {commSettings.map((setting) => (
              <tr key={setting.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  {setting.port_name}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {setting.comm_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {setting.baud_rate}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {setting.parity}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {setting.data_bits}/{setting.stop_bits}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {setting.port_owner}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(setting.id)}
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

        {commSettings.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No communication port settings yet</p>
            <p className="text-sm mt-2">Add your first port configuration</p>
          </div>
        )}
      </div>
    </div>
  );
}
