import Link from 'next/link';
import { ROUTES } from '../utils/routes';
import Button from '../components/common/Button';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="py-20 sm:py-28 bg-[#F7F7F7] border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-semibold bg-white text-[#111111] border border-[#E5E5E5] mb-8">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111]" aria-hidden="true" />
            Service Booking Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-tight max-w-4xl mx-auto">
            On-Demand Local Services, Scheduled in Real Time
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#666666] leading-relaxed max-w-2xl mx-auto">
            A production service marketplace with live calendar availability, slot locking, and
            guaranteed zero double-booking concurrency protection.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href={ROUTES.SERVICES} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3 text-sm font-semibold rounded-sm">
                Browse Services
              </Button>
            </Link>
            <Link href={ROUTES.REGISTER} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 text-sm font-medium bg-white rounded-sm">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Platform Architecture Features */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Platform Features
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Engineered for seamless service discovery and conflict-free appointment booking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 rounded-sm border border-[#E5E5E5] bg-[#F7F7F7]">
              <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#111111] mb-2">
                Service Catalog &amp; Filters
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Filter by service categories, search keywords, price ranges, and sorting preferences with live paginated results.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 rounded-sm border border-[#E5E5E5] bg-[#F7F7F7]">
              <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#111111] mb-2">
                Real-Time Slot Scheduling
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Dynamic slot generation based on provider schedules, inspecting booked intervals and preventing conflict before submission.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 rounded-sm border border-[#E5E5E5] bg-[#F7F7F7]">
              <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#111111] mb-2">
                Concurrency Protection
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed">
                Database-level locking guarantees zero double-booking even under concurrent simultaneous booking attempts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Participation */}
      <section className="py-16 sm:py-20 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Role-Based Workflows
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Dedicated interfaces tailored for customers and service providers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Customer Role Card */}
            <div className="rounded-sm border border-[#E5E5E5] p-8 bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111111]">For Customers</h3>
                <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                  Browse verified services, check live calendar availability, book appointments, and track your booking statuses.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs text-[#666666]">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111] mr-2 flex-shrink-0" aria-hidden="true" />
                    Marketplace catalog with keyword search and price filters
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111] mr-2 flex-shrink-0" aria-hidden="true" />
                    Instant slot selection with locked price guarantee
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111] mr-2 flex-shrink-0" aria-hidden="true" />
                    Customer dashboard with booking history and cancellation
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E5E5E5]">
                <Link href={ROUTES.SERVICES}>
                  <Button variant="primary" size="md" className="w-full rounded-sm font-semibold">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Provider Role Card */}
            <div className="rounded-sm border border-[#E5E5E5] p-8 bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-sm bg-[#111111] text-white flex items-center justify-center mb-6">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111111]">For Service Providers</h3>
                <p className="mt-2 text-sm text-[#666666] leading-relaxed">
                  List custom services, configure durations and prices, accept or reject incoming booking requests, and manage schedules.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs text-[#666666]">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111] mr-2 flex-shrink-0" aria-hidden="true" />
                    Complete service listing management (create, edit, deactivate)
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111] mr-2 flex-shrink-0" aria-hidden="true" />
                    Incoming booking request review with Accept/Reject actions
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#111111] mr-2 flex-shrink-0" aria-hidden="true" />
                    Provider schedule calendar grouped by upcoming and past slots
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E5E5E5]">
                <Link href={ROUTES.REGISTER}>
                  <Button variant="outline" size="md" className="w-full rounded-sm font-semibold">
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
