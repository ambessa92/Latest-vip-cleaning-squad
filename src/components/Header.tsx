import { useState } from 'react';
import logo from '../assets/vip-cleaning-squad-logo.gif';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="inline-block">
            <img src={logo} alt="VIP Cleaning Squad Logo" className="h-10" />
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <button type="button" className="text-text hover:text-secondary font-medium">
              About Us
            </button>
            <button type="button" className="text-text hover:text-secondary font-medium">
              SERVICES
            </button>
            <button type="button" className="text-text hover:text-secondary font-medium">
              Gift Cards
            </button>
            <a href="/locations" className="text-text hover:text-secondary font-medium">
              Service Areas
            </a>
            <button type="button" className="text-text hover:text-secondary font-medium">
              Join Team
            </button>
            <button type="button" className="text-text hover:text-secondary font-medium">
              Contact
            </button>
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button className="bg-primary text-text px-4 py-2 rounded font-medium uppercase">
            Book Online
          </button>
          <button className="text-text hover:text-secondary font-medium">
            Login
          </button>
        </div>

        <button
          className="md:hidden text-text"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3">
              <button type="button" className="text-text hover:text-secondary font-medium text-left">
                About Us
              </button>
              <button type="button" className="text-text hover:text-secondary font-medium text-left">
                SERVICES
              </button>
              <button type="button" className="text-text hover:text-secondary font-medium text-left">
                Gift Cards
              </button>
              <a href="/locations" className="text-text hover:text-secondary font-medium">
                Service Areas
              </a>
              <button type="button" className="text-text hover:text-secondary font-medium text-left">
                Join Team
              </button>
              <button type="button" className="text-text hover:text-secondary font-medium text-left">
                Contact
              </button>
              <button className="bg-primary text-text px-4 py-2 rounded font-medium uppercase w-full">
                Book Online
              </button>
              <button className="text-text hover:text-secondary font-medium">
                Login
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
