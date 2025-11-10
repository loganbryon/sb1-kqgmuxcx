import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Download, Upload, Network } from 'lucide-react';

interface NetworkDevice {
  id: string;
  project_id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  subnet_mask: string;
  gateway: string;
  mac_address: string;
  port: string;
  protocol: string;
  description: string;
  position_x: number;
  position_y: number;
}

interface NetworkTopologyProps {
  projectId: string;
}

const deviceTypes = [
  'PLC',
  'HMI',
  'Switch',
  'Router',
  'Gateway',
  'I/O Module',
  'VFD',
  'Sensor',
  'Camera',
  'Server',
  'Workstation',
  'Other'
];

const protocols = [
  'Ethernet/IP',
  'Modbus TCP',
  'Profinet',
  'OPC UA',
  'BACnet/IP',
  'MQTT',
  'HTTP/HTTPS',
  'FTP',
  'SSH',
  'Other'
];

export default function NetworkTopology({ projectId }: NetworkTopologyProps) {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'PLC',
    ip_address: '',
    subnet_mask: '255.255.255.0',
    gateway: '',
    mac_address: '',
    port: '',
    protocol: 'Ethernet/IP',
    description: '',
  });

  useEffect(() => {
    fetchDevices();
  }, [projectId]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('network_topology')
        .select('*')
        .eq('project_id', projectId)
        .order('device_name');

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching network devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('network_topology')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('network_topology')
          .insert([{ ...formData, project_id: projectId }]);

        if (error) throw error;
      }

      setFormData({
        device_name: '',
        device_type: 'PLC',
        ip_address: '',
        subnet_mask: '255.255.255.0',
        gateway: '',
        mac_address: '',
        port: '',
        protocol: 'Ethernet/IP',
        description: '',
      });
      setEditingId(null);
      fetchDevices();
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  const handleEdit = (device: NetworkDevice) => {
    setFormData({
      device_name: device.device_name,
      device_type: device.device_type,
      ip_address: device.ip_address,
      subnet_mask: device.subnet_mask,
      gateway: device.gateway,
      mac_address: device.mac_address,
      port: device.port,
      protocol: device.protocol,
      description: device.description,
    });
    setEditingId(device.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this device?')) return;

    try {
      const { error } = await supabase
        .from('network_topology')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const handleExport = () => {
    const headers = [
      'Device Name',
      'Device Type',
      'IP Address',
      'Subnet Mask',
      'Gateway',
      'MAC Address',
      'Port',
      'Protocol',
      'Description'
    ];

    const rows = devices.map(device => [
      device.device_name,
      device.device_type,
      device.ip_address,
      device.subnet_mask,
      device.gateway,
      device.mac_address,
      device.port,
      device.protocol,
      device.description,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network_topology.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          alert('File is empty or invalid');
          return;
        }

        const dataRows = rows.slice(1);
        const importedDevices = dataRows
          .filter(row => row[0]?.trim())
          .map(row => ({
            project_id: projectId,
            device_name: row[0]?.trim() || '',
            device_type: row[1]?.trim() || 'Other',
            ip_address: row[2]?.trim() || '',
            subnet_mask: row[3]?.trim() || '255.255.255.0',
            gateway: row[4]?.trim() || '',
            mac_address: row[5]?.trim() || '',
            port: row[6]?.trim() || '',
            protocol: row[7]?.trim() || '',
            description: row[8]?.trim() || '',
          }));

        if (importedDevices.length === 0) {
          alert('No valid data found in file');
          return;
        }

        const { error } = await supabase
          .from('network_topology')
          .insert(importedDevices);

        if (error) throw error;
        fetchDevices();
      } catch (error) {
        console.error('Error importing devices:', error);
        alert('Error importing file. Please check the format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading network topology...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Network className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Network Topology</h2>
              <p className="text-sm text-slate-600">Manage network devices and infrastructure</p>
            </div>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Upload size={18} />
              Import
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              disabled={devices.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <input
            type="text"
            placeholder="Device Name"
            value={formData.device_name}
            onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <select
            value={formData.device_type}
            onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {deviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="IP Address"
            value={formData.ip_address}
            onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <input
            type="text"
            placeholder="Subnet Mask"
            value={formData.subnet_mask}
            onChange={(e) => setFormData({ ...formData, subnet_mask: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Gateway"
            value={formData.gateway}
            onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="MAC Address"
            value={formData.mac_address}
            onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Port"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={formData.protocol}
            onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {protocols.map(protocol => (
              <option key={protocol} value={protocol}>{protocol}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2 lg:col-span-3"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} />
            {editingId ? 'Update' : 'Add Device'}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Device Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">IP Address</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Subnet</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Gateway</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">MAC</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Port</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Protocol</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500">
                    No network devices added yet. Add your first device above.
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{device.device_name}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {device.device_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono text-sm">{device.ip_address}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{device.subnet_mask}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{device.gateway}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{device.mac_address}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{device.port}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{device.protocol}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{device.description}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(device)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {devices.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Total Devices: <span className="font-semibold">{devices.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
