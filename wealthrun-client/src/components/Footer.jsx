import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-yellow-400 p-6 mt-10 border-t border-yellow-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex space-x-6">
          <Link to="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
        </div>
        <div className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} WealthRun. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
