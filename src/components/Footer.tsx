import logo from '../assets/hellamaid-logo.gif';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">AREAS WE SERVE</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Toronto</span></li>
              <li><span className="text-gray-300">Vancouver</span></li>
              <li><span className="text-gray-300">Ottawa</span></li>
              <li><span className="text-gray-300">Calgary</span></li>
              <li><span className="text-gray-300">Edmonton</span></li>
              <li><span className="text-gray-300">Kitchener</span></li>
              <li><span className="text-gray-300">London</span></li>
              <li><span className="text-gray-300">Guelph</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">SERVICES</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Cleaning Checklist</span></li>
              <li><span className="text-gray-300">House Cleaning</span></li>
              <li><span className="text-gray-300">Condo and Apartment Cleaning</span></li>
              <li><span className="text-gray-300">Deep Cleaning Service</span></li>
              <li><span className="text-gray-300">Move In Move Out Cleaning</span></li>
              <li><span className="text-gray-300">Post Renovation Cleaning</span></li>
              <li><span className="text-gray-300">Green and Eco-Friendly Cleaning</span></li>
              <li><span className="text-gray-300">AirBnB Cleaning</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">GET IN TOUCH</h3>
            <ul className="space-y-2">
              <li>
                <a href="tel:1-888-847-2532" className="text-gray-300 hover:text-primary flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  1-888-VIP-CLEAN
                </a>
              </li>
              <li>
                <a href="mailto:info@vipcleaningsquad.com" className="text-gray-300 hover:text-primary flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  info@vipcleaningsquad.com
                </a>
              </li>
              <li>
                <button className="bg-primary text-text px-4 py-2 rounded font-medium hover:bg-primary-dark transition duration-300 w-full mb-2">
                  Book Online
                </button>
              </li>
              <li>
                <button className="bg-white text-text px-4 py-2 rounded font-medium w-full mb-2">
                  Gift Cards
                </button>
              </li>
              <li>
                <button className="bg-primary text-text px-4 py-2 rounded font-medium hover:bg-primary-dark transition duration-300 w-full">
                  Our Reviews
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img src={logo} alt="Company Logo" className="h-10 mb-2" />
            <div className="text-sm text-gray-400">
              1. Delighting Homeowners
              2. Supporting Communities
              3. Empowering Cleaners
            </div>
          </div>

          <div className="flex space-x-4">
            <span className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </span>
            <span className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </span>
            <span className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </span>
            <span className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Copyright © 2025 Company Inc • All Rights Reserved • Terms and Conditions • Privacy Policy • Proudly Canadian
        </div>
      </div>
    </footer>
  );
}
