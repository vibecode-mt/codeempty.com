'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Page {
  page_id: string;
  type: 'home' | 'project' | 'about' | 'blog';
  slug: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setAdminEmail(email || '');
    fetchPages(token);
  }, [router]);

  const fetchPages = async (token: string) => {
    try {
      const response = await fetch(\\/api/admin/content/pages\, {
        headers: { 'Authorization': \Bearer \\ },
      });

      if (!response.ok) {
        setError('Failed to load pages');
        return;
      }

      const data = await response.json();
      setPages(data.pages || []);
    } catch (err) {
      setError('Error loading pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  const handleNewPage = () => {
    router.push('/admin/pages/new');
  };

  return (
    <div className='dashboard'>
      <nav className='sidebar'>
        <div className='logo'>CodeEmpty.com</div>
        <ul className='menu'>
          <li><a href='/admin/dashboard' className='active'>Dashboard</a></li>
          <li><a href='/admin/pages'>Pages</a></li>
          <li><a href='/admin/settings'>Settings</a></li>
          <li><a href='/admin/apps'>OAuth Apps</a></li>
          <li><a href='/admin/account'>Account</a></li>
        </ul>
        <button onClick={handleLogout} className='btn-logout'>Logout</button>
      </nav>

      <div className='content'>
        <header className='header'>
          <h1>Dashboard</h1>
          <div className='user-info'>Logged in as: {adminEmail}</div>
        </header>

        <main className='main'>
          <section className='card'>
            <h2>Pages ({pages.length})</h2>
            {loading && <p>Loading...</p>}
            {error && <p className='error'>{error}</p>}
            {!loading && pages.length === 0 && (
              <div className='empty-state'>
                <p>No pages yet. Create your first page!</p>
                <button onClick={handleNewPage} className='btn-primary'>Create Page</button>
              </div>
            )}
            {!loading && pages.length > 0 && (
              <table className='pages-table'>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Slug</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.page_id}>
                      <td>{page.title}</td>
                      <td>{page.type}</td>
                      <td>/{page.slug}</td>
                      <td>{new Date(page.created_at).toLocaleDateString()}</td>
                      <td>
                        <a href={\/admin/pages/\\} className='link'>Edit</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className='card'>
            <h2>Quick Links</h2>
            <ul className='quick-links'>
              <li><a href='/'>View Site</a></li>
              <li><a href='/admin/login'>Change Password</a></li>
              <li><a href='/admin/settings'>Manage Settings</a></li>
            </ul>
          </section>
        </main>
      </div>

      <style jsx>{\
        .dashboard { display: flex; min-height: 100vh; }
        .sidebar { width: 250px; background: #2c3e50; color: white; padding: 20px; }
        .logo { font-size: 20px; font-weight: bold; margin-bottom: 30px; }
        .menu { list-style: none; padding: 0; margin: 0; }
        .menu li { margin-bottom: 10px; }
        .menu a { color: #bbb; text-decoration: none; display: block; padding: 10px; border-radius: 4px; transition: all 0.3s; }
        .menu a:hover { background: rgba(255, 255, 255, 0.1); color: white; }
        .menu a.active { background: #667eea; color: white; }
        .btn-logout { width: 100%; padding: 10px; background: #c33; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 30px; }
        .content { flex: 1; }
        .header { background: white; padding: 20px 30px; border-bottom: 1px solid #eee; }
        .header h1 { margin: 0; font-size: 28px; }
        .user-info { font-size: 13px; color: #999; margin-top: 5px; }
        .main { padding: 30px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .card h2 { margin-top: 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-state p { color: #999; margin-bottom: 20px; }
        .pages-table { width: 100%; border-collapse: collapse; }
        .pages-table th, .pages-table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
        .pages-table th { background: #f5f5f5; font-weight: 600; }
        .link { color: #667eea; text-decoration: none; }
        .link:hover { text-decoration: underline; }
        .quick-links { list-style: none; padding: 0; }
        .quick-links li { margin-bottom: 10px; }
        .quick-links a { color: #667eea; text-decoration: none; }
        .quick-links a:hover { text-decoration: underline; }
        .error { color: #c33; }
        .btn-primary { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary:hover { background: #5568d3; }
      \}</style>
    </div>
  );
}
