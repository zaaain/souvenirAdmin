import { Link } from 'react-router-dom'
import { Button } from '@components/buttons'
import bgAuth from '@assets/png/bgAuth.png'

const NotFound = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${bgAuth})` }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white rounded-full h-[50vh] w-[50vh] flex flex-col items-center justify-center shadow-2xl p-8">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6 text-center px-4">
            The page you are looking for does not exist.
          </p>
          <Link to="/auth/login">
            <Button variant="primary">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

