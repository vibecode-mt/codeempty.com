export default function Home() {
  return (
    <main>
      <h1>CodeEmpty.com</h1>
      
      <section>
        <h2>Welcome!</h2>
        <p>This is the CodeEmpty.com portfolio and blog site. Content management is powered by our custom CMS.</p>
      </section>

      <section>
        <h2>Getting Started</h2>
        <ul>
          <li><a href="/admin/login">Admin Dashboard</a> - Manage content</li>
          <li><a href="https://github.com/vibecode-mt/codeempty.com">GitHub Repository</a> - View source code</li>
          <li><a href="/README.md">Documentation</a> - Learn more</li>
        </ul>
      </section>

      <section className="info">
        <h3>Coming Soon</h3>
        <p>Projects, blog posts, and more will be added here through the admin dashboard.</p>
      </section>
    </main>
  );
}
