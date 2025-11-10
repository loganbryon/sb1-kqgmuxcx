import { useState, useEffect } from 'react';
import { supabase, Project, IOPoint, CauseEffect, ModbusRegisterMap, ModbusMasterTable, CommPortSettings } from '../lib/supabase';
import {
  ArrowLeft,
  Download,
  FileText,
  Code,
  Grid3x3,
  Radio,
  Settings,
  Network,
  Monitor,
} from 'lucide-react';
import IOList from './IOList';
import CauseEffectMatrix from './CauseEffectMatrix';
import ModbusRegisterMapComponent from './ModbusRegisterMap';
import ModbusMasterTableComponent from './ModbusMasterTable';
import CommPortSettingsComponent from './CommPortSettings';
import {
  exportToExcel,
  generateControlTheory,
  generateLadderLogic,
} from '../lib/exportUtils';

type ProjectWorkspaceProps = {
  project: Project;
  onBack: () => void;
};

type Tab = 'io' | 'matrix' | 'modbus' | 'master' | 'comm' | 'hmi' | 'theory' | 'ladder';

export default function ProjectWorkspace({
  project,
  onBack,
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>('io');
  const [ioPoints, setIOPoints] = useState<IOPoint[]>([]);
  const [causeEffects, setCauseEffects] = useState<CauseEffect[]>([]);
  const [registerMaps, setRegisterMaps] = useState<ModbusRegisterMap[]>([]);
  const [masterTables, setMasterTables] = useState<ModbusMasterTable[]>([]);
  const [commSettings, setCommSettings] = useState<CommPortSettings[]>([]);
  const [controlTheory, setControlTheory] = useState('');
  const [ladderLogic, setLadderLogic] = useState('');

  useEffect(() => {
    loadData();
  }, [project.id]);

  const loadData = async () => {
    const { data: ioData } = await supabase
      .from('io_points')
      .select('*')
      .eq('project_id', project.id)
      .order('tag_name');

    const { data: ceData } = await supabase
      .from('cause_effect_matrix')
      .select('*')
      .eq('project_id', project.id);

    const { data: regData } = await supabase
      .from('modbus_register_map')
      .select('*')
      .eq('project_id', project.id)
      .order('table_number');

    const { data: masterData } = await supabase
      .from('modbus_master_table')
      .select('*')
      .eq('project_id', project.id);

    const { data: commData } = await supabase
      .from('comm_port_settings')
      .select('*')
      .eq('project_id', project.id);

    if (ioData) setIOPoints(ioData);
    if (ceData) setCauseEffects(ceData);
    if (regData) setRegisterMaps(regData);
    if (masterData) setMasterTables(masterData);
    if (commData) setCommSettings(commData);
  };

  const handleExport = () => {
    exportToExcel(project.name, ioPoints, causeEffects);
  };

  const handleGenerateTheory = () => {
    const theory = generateControlTheory(
      project.name,
      project.plc_type,
      ioPoints,
      causeEffects
    );
    setControlTheory(theory);
    setActiveTab('theory');
  };

  const handleGenerateLadder = () => {
    const ladder = generateLadderLogic(
      project.name,
      project.plc_type,
      ioPoints,
      causeEffects
    );
    setLadderLogic(ladder);
    setActiveTab('ladder');
  };

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {project.name}
                </h1>
                <p className="text-sm text-slate-600">{project.plc_type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateTheory}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileText size={18} />
                Theory
              </button>
              <button
                onClick={handleGenerateLadder}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Code size={18} />
                Ladder Logic
              </button>
              <button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('io')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'io'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid3x3 size={18} />
                I/O List
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'matrix'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid3x3 size={18} />
                Cause & Effect
              </button>
              <button
                onClick={() => setActiveTab('modbus')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'modbus'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Radio size={18} />
                Modbus Map
              </button>
              <button
                onClick={() => setActiveTab('master')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'master'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Network size={18} />
                Master Table
              </button>
              <button
                onClick={() => setActiveTab('comm')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'comm'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Settings size={18} />
                Comm Settings
              </button>
              <button
                onClick={() => setActiveTab('hmi')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'hmi'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Monitor size={18} />
                HMI Info
              </button>
              {controlTheory && (
                <button
                  onClick={() => setActiveTab('theory')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'theory'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText size={18} />
                  Control Theory
                </button>
              )}
              {ladderLogic && (
                <button
                  onClick={() => setActiveTab('ladder')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'ladder'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code size={18} />
                  Ladder Logic
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'io' && (
              <IOList
                projectId={project.id}
                ioPoints={ioPoints}
                onUpdate={loadData}
              />
            )}
            {activeTab === 'matrix' && (
              <CauseEffectMatrix
                projectId={project.id}
                ioPoints={ioPoints}
                causeEffects={causeEffects}
                onUpdate={loadData}
              />
            )}
            {activeTab === 'modbus' && (
              <ModbusRegisterMapComponent
                projectId={project.id}
                registerMaps={registerMaps}
                onUpdate={loadData}
              />
            )}
            {activeTab === 'master' && (
              <ModbusMasterTableComponent
                projectId={project.id}
                masterTables={masterTables}
                onUpdate={loadData}
              />
            )}
            {activeTab === 'comm' && (
              <CommPortSettingsComponent
                projectId={project.id}
                commSettings={commSettings}
                onUpdate={loadData}
              />
            )}
            {activeTab === 'hmi' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">HMI Configuration</h2>
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        HMI Type
                      </label>
                      <p className="text-slate-900 text-lg">
                        {project.hmi_type || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        HMI Details & Configuration
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {project.hmi_details || 'No details provided'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Common HMI/SCADA Systems:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Ignition SCADA:</strong> Web-based, unlimited licensing, SQL database integration</li>
                        <li>• <strong>FactoryTalk View:</strong> Rockwell Automation, Allen-Bradley integration</li>
                        <li>• <strong>WinCC:</strong> Siemens platform, TIA Portal integration</li>
                        <li>• <strong>Wonderware:</strong> Cloud-ready, InTouch HMI, System Platform</li>
                        <li>• <strong>Web HMI:</strong> Browser-based, responsive design, remote access</li>
                        <li>• <strong>AVEVA:</strong> Industrial software suite with cloud capabilities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'theory' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Control Theory Document
                  </h2>
                  <button
                    onClick={() =>
                      downloadText(
                        controlTheory,
                        `${project.name}_theory.txt`
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
                <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm overflow-auto max-h-[600px] whitespace-pre-wrap font-mono">
                  {controlTheory}
                </pre>
              </div>
            )}
            {activeTab === 'ladder' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Ladder Logic Code
                  </h2>
                  <button
                    onClick={() =>
                      downloadText(ladderLogic, `${project.name}_ladder.st`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
                <pre className="bg-slate-900 text-green-400 rounded-lg p-4 text-sm overflow-auto max-h-[600px] whitespace-pre-wrap font-mono">
                  {ladderLogic}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
