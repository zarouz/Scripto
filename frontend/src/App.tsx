import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScriptView from './pages/ScriptView';
import Dashboard from './pages/Dashboard';
// 👇 Add the .tsx extension to the import path
import ProjectHomepage from './pages/ProjectHomepage.tsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects/:projectId" element={<ProjectHomepage />} />
                <Route path="scripts/:scriptId" element={<ScriptView />} />
            </Route>
        </Routes>
    );
}

export default App;