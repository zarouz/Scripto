import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-zinc-900 text-gray-200">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* You can add a header here if you want */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;