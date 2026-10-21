function FeedbackMessage({ title, children, type = 'info' }) {
  return (
    <div className={`feedback feedback--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <strong>{title}</strong>
      {children && <span>{children}</span>}
    </div>
  )
}

export default FeedbackMessage
