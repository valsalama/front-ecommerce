function PageHeading({ eyebrow, title, description, children }) {
  return (
    <header className="page-heading">
      <div>
        <p className="page-heading__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-heading__description">{description}</p>}
      </div>
      {children && <div className="page-heading__actions">{children}</div>}
    </header>
  )
}

export default PageHeading
