import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';

type ProjectListProps = {
  onSelectProject: (project: Project) => void;
};

export default function ProjectList({ onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectPLC, setNewProjectPLC] = useState('Siemens S7-1200');
  const [newProjectHMI, setNewProjectHMI] = useState('');
  const [newProjectHMIDetails, setNewProjectHMIDetails] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          name: newProjectName,
          description: newProjectDesc,
          plc_type: newProjectPLC,
          hmi_type: newProjectHMI,
          hmi_details: newProjectHMIDetails,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setProjects([data, ...projects]);
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectPLC('Siemens S7-1200');
      setNewProjectHMI('');
      setNewProjectHMIDetails('');
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
          <p className="text-slate-600 mt-1">
            Manage your automation control projects
          </p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {showNewProject && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Create New Project
          </h2>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                PLC Type
              </label>
              <select
                value={newProjectPLC}
                onChange={(e) => setNewProjectPLC(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Siemens S7-1200</option>
                <option>Siemens S7-1500</option>
                <option>Allen-Bradley ControlLogix</option>
                <option>Allen-Bradley CompactLogix</option>
                <option>Mitsubishi FX5</option>
                <option>Schneider Modicon M580</option>
                <option>ABB XIO</option>
                <option>ROC800</option>
                <option>GE Fanuc</option>
                <option>IDEC</option>
                <option>Generic PLC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                HMI Type
              </label>
              <input
                type="text"
                value={newProjectHMI}
                onChange={(e) => setNewProjectHMI(e.target.value)}
                placeholder="e.g., Ignition SCADA, FactoryTalk View, WinCC, Web HMI"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                HMI Details & Configuration
              </label>
              <textarea
                value={newProjectHMIDetails}
                onChange={(e) => setNewProjectHMIDetails(e.target.value)}
                placeholder="Web-based SCADA, cloud connectivity, tag count, screen count, etc."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {project.description}
                </p>
                <div className="flex gap-4 text-sm text-slate-500">
                  <span className="font-medium">{project.plc_type}</span>
                  <span>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectProject(project)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  title="Open Project"
                >
                  <FolderOpen size={20} />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && !showNewProject && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No projects yet</p>
            <p className="text-sm mt-2">
              Click "New Project" to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
