import { Link } from 'react-router-dom'

function ButtonLink({ children, secondary = false, ...props }) {
  return (
    <Link
      className={`button-link${secondary ? ' button-link--secondary' : ''}`}
      {...props}
    >
      {children}
    </Link>
  )
}

export default ButtonLink
