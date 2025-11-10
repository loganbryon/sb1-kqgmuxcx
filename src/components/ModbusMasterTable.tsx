import { useState } from 'react';
import { supabase, ModbusMasterTable } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

type ModbusMasterTableProps = {
  projectId: string;
  masterTables: ModbusMasterTable[];
  onUpdate: () => void;
};

const FUNCTION_CODES = [
  { value: 1, label: '1 - Read Coil Status' },
  { value: 2, label: '2 - Read Input Status' },
  { value: 3, label: '3 - Read Holding Registers' },
  { value: 4, label: '4 - Read Input Registers' },
  { value: 5, label: '5 - Force Single Coil' },
  { value: 6, label: '6 - Preset Single Register' },
  { value: 15, label: '15 - Force Multiple Coils' },
  { value: 16, label: '16 - Preset Multiple Registers' },
];

export default function ModbusMasterTableComponent({
  projectId,
  masterTables,
  onUpdate,
}: ModbusMasterTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tru_address: '',
    function_code: 3,
    slave_register: 0,
    master_register: 0,
    number_of_registers: 1,
  });

  const resetForm = () => {
    setFormData({
      tru_address: '',
      function_code: 3,
      slave_register: 0,
      master_register: 0,
      number_of_registers: 1,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('modbus_master_table')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('modbus_master_table')
        .insert([{ ...formData, project_id: projectId }]);
    }

    resetForm();
    onUpdate();
  };

  const handleEdit = (master: ModbusMasterTable) => {
    setFormData({
      tru_address: master.tru_address,
      function_code: master.function_code,
      slave_register: master.slave_register,
      master_register: master.master_register,
      number_of_registers: master.number_of_registers,
    });
    setEditingId(master.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this master table entry?')) return;
    await supabase.from('modbus_master_table').delete().eq('id', id);
    onUpdate();
  };

  const getFunctionCodeLabel = (code: number) => {
    const fc = FUNCTION_CODES.find((f) => f.value === code);
    return fc ? fc.label : `FC ${code}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Master Table</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure Modbus master-slave communication parameters
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Master Entry
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Master Entry' : 'New Master Entry'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  TRU Address
                </label>
                <input
                  type="text"
                  value={formData.tru_address}
                  onChange={(e) =>
                    setFormData({ ...formData, tru_address: e.target.value })
                  }
                  placeholder="e.g., 1, 2, 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Function Code
                </label>
                <select
                  value={formData.function_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      function_code: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {FUNCTION_CODES.map((fc) => (
                    <option key={fc.value} value={fc.value}>
                      {fc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slave Register
                </label>
                <input
                  type="number"
                  value={formData.slave_register}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slave_register: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Master Register
                </label>
                <input
                  type="number"
                  value={formData.master_register}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      master_register: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Registers
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.number_of_registers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_registers: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-amber-900 mb-2">Master Table Configuration:</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• TRU Address: Slave device address on the Modbus network (1-247)</li>
          <li>• Function Code: Specifies the type of Modbus operation</li>
          <li>• Slave Register: Starting register address in the slave device</li>
          <li>• Master Register: Starting register address in the master controller</li>
          <li>• Number of Registers: Quantity of consecutive registers to read/write</li>
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                TRU Address
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Function Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Slave Register
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Master Register
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                # of Registers
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {masterTables.map((master) => (
              <tr key={master.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-mono text-slate-900">
                  {master.tru_address}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {getFunctionCodeLabel(master.function_code)}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {master.slave_register}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {master.master_register}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {master.number_of_registers}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(master)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(master.id)}
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

        {masterTables.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No master table entries yet</p>
            <p className="text-sm mt-2">Add your first entry to configure master-slave communication</p>
          </div>
        )}
      </div>
    </div>
  );
}
