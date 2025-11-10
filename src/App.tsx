import { useState, useEffect } from 'react';
import { supabase, Project } from './lib/supabase';
import AuthForm from './components/AuthForm';
import ProjectList from './components/ProjectList';
import ProjectWorkspace from './components/ProjectWorkspace';
import Presentation from './components/Presentation';
import { LogOut, Presentation as PresentationIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState<unknown>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPresentation, setShowPresentation] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => setLoading(true)} />;
  }

  if (showPresentation) {
    return (
      <div>
        <button
          onClick={() => setShowPresentation(false)}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-slate-900/80 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
        >
          Back to App
        </button>
        <Presentation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {!selectedProject && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-900">
              PLC Automation Suite
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPresentation(true)}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
              >
                <PresentationIcon size={20} />
                Presentation
              </button>
              <button
                onClick={handleSignOut}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProject ? (
        <ProjectWorkspace
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <ProjectList onSelectProject={setSelectedProject} />
      )}
    </div>
  );
}

export default App;
