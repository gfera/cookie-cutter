import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 relative">
        <Scene />
      </div>
    </div>
  );
}

export default App;
