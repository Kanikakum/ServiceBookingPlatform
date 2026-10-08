import Link from 'next/link';
import { ROUTES } from '../utils/routes';
import Button from '../components/common/Button';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 mb-6">
              Production-Grade Service Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              On-Demand Services,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Guaranteed Available
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              Book verified local professionals with real-time slot scheduling and guaranteed zero
              double-booking protection. Whether you need deep home cleaning, plumbing, or electrical repairs.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base">
                  Get Started Free
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base">
                  Sign In to Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Feature Cards */}
      <section className="bg-white py-16 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Choose How You Want to Participate
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Role-based access designed specifically for customers and service providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Customer Role Card */}
            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-indigo-50/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Customers</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Search trusted local service catalogs, check live calendar availability, book instantly, and manage your appointments.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                    Browse 8+ service categories with price filters
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                    Instant booking confirmation with price lock
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                    One-click appointment cancellation
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="md" className="w-full">
                    Join as Customer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Provider Role Card */}
            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-violet-50/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Service Providers</h3>
                <p className="mt-2 text-sm text-gray-600">
                  List custom services, set prices & durations, receive customer bookings, accept or decline requests, and manage schedules.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mr-2" />
                    Full service CRUD management
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mr-2" />
                    Lock-protected schedule prevents double-booking
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mr-2" />
                    Accept or reject booking workflow
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <Link href={ROUTES.REGISTER}>
                  <Button variant="outline" size="md" className="w-full border-violet-300 text-violet-700 hover:bg-violet-50">
                    Join as Provider
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
