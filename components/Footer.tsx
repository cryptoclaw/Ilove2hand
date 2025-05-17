"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-6 mt-12">
      <div className="container mx-auto text-sm text-gray-600">
        <p>© {new Date().getFullYear()} ICN_FREEZE. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
          <a href="/contact" className="hover:underline">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
