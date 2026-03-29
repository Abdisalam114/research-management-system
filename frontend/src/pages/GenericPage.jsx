export default function GenericPage({ title, icon: Icon, description }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description || `Manage and view ${title.toLowerCase()}.`}</p>
      </div>
      
      <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="empty-state">
          {Icon && <Icon className="empty-icon" size={48} />}
          <div className="empty-title">{title} module is under construction</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            This section is currently being developed. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
