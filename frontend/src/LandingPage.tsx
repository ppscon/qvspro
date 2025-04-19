import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiServer, FiCode, FiLock, FiArrowRight } from 'react-icons/fi';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-qvs.png" 
            alt="Quantum Computing Visualization" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
                Quantum Vulnerability Scanner
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-2xl">
                Prepare your codebase for the quantum era. Identify and fix cryptographic vulnerabilities before quantum computers can exploit them.
              </p>
              <div className="mt-10 flex gap-4">
                <Link 
                  to="/app" 
                  className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </Link>
                <a 
                  href="#learn-more" 
                  className="px-8 py-3 rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-400 hover:bg-opacity-10 font-medium transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-purple-500 bg-opacity-20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-8 bg-indigo-500 bg-opacity-20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/images/logo-qvs.png" 
                    alt="QVS Logo" 
                    className="w-48 h-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="learn-more" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Quantum Timeline</span>
        </h2>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-600 bg-opacity-30"></div>
          {/* Timeline Events */}
          <div className="space-y-24">
            {/* Event 1 */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 bg-opacity-30 rounded-full animate-ping"></div>
              </div>
              <div className="ml-8 md:ml-0 md:grid md:grid-cols-2 md:gap-8">
                <div className="hidden md:block md:text-right pr-8">
                  <h3 className="text-xl font-semibold text-blue-400">1994</h3>
                  <p className="text-gray-400">Shor's Algorithm</p>
                </div>
                <div className="md:pl-8">
                  <h3 className="md:hidden text-xl font-semibold text-blue-400">1994: Shor's Algorithm</h3>
                  <p className="text-gray-300">Peter Shor develops an algorithm that allows quantum computers to factor large numbers exponentially faster than classical computers, threatening RSA encryption.</p>
                </div>
              </div>
            </div>
            {/* Event 2 */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 bg-opacity-30 rounded-full animate-ping"></div>
              </div>
              <div className="ml-8 md:ml-0 md:grid md:grid-cols-2 md:gap-8">
                <div className="hidden md:block md:text-right pr-8">
                  <h3 className="text-xl font-semibold text-blue-400">2019</h3>
                  <p className="text-gray-400">Quantum Supremacy</p>
                </div>
                <div className="md:pl-8">
                  <h3 className="md:hidden text-xl font-semibold text-blue-400">2019: Quantum Supremacy</h3>
                  <p className="text-gray-300">Google claims to achieve quantum supremacy, with a quantum computer performing a specific calculation faster than the world's most powerful supercomputers.</p>
                </div>
              </div>
            </div>
            {/* Event 3 */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-indigo-500 bg-opacity-30 rounded-full animate-ping"></div>
              </div>
              <div className="ml-8 md:ml-0 md:grid md:grid-cols-2 md:gap-8">
                <div className="hidden md:block md:text-right pr-8">
                  <h3 className="text-xl font-semibold text-blue-400">Today</h3>
                  <p className="text-gray-400">Preparing for the Quantum Era</p>
                </div>
                <div className="md:pl-8">
                  <h3 className="md:hidden text-xl font-semibold text-blue-400">Today: Preparing for the Quantum Era</h3>
                  <p className="text-gray-300">Organizations worldwide are starting to assess their cryptographic vulnerabilities and migrate to quantum-resistant algorithms before large-scale quantum computers become reality.</p>
                </div>
              </div>
            </div>
            {/* Event 4 */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full pulse-glow"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-500 bg-opacity-30 rounded-full animate-ping"></div>
              </div>
              <div className="ml-8 md:ml-0 md:grid md:grid-cols-2 md:gap-8">
                <div className="hidden md:block md:text-right pr-8">
                  <h3 className="text-xl font-semibold text-blue-400">Q-Day</h3>
                  <p className="text-gray-400">Quantum Computers Break Encryption</p>
                </div>
                <div className="md:pl-8">
                  <h3 className="md:hidden text-xl font-semibold text-blue-400">Q-Day: Quantum Computers Break Encryption</h3>
                  <p className="text-gray-300">The day when quantum computers become powerful enough to break current public key cryptography, potentially putting unprepared systems and data at risk.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Why QVS Pro?</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl hover:shadow-lg hover:bg-opacity-70 transition-all">
            <div className="w-12 h-12 bg-blue-600 bg-opacity-30 rounded-lg flex items-center justify-center mb-5">
              <FiShield size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Identify Vulnerabilities</h3>
            <p className="text-gray-400">Scan your codebase to identify cryptographic algorithms vulnerable to quantum attacks.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl hover:shadow-lg hover:bg-opacity-70 transition-all">
            <div className="w-12 h-12 bg-purple-600 bg-opacity-30 rounded-lg flex items-center justify-center mb-5">
              <FiCode size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Multi-Language Support</h3>
            <p className="text-gray-400">Support for various programming languages and frameworks for comprehensive scanning.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl hover:shadow-lg hover:bg-opacity-70 transition-all">
            <div className="w-12 h-12 bg-indigo-600 bg-opacity-30 rounded-lg flex items-center justify-center mb-5">
              <FiLock size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Remediation Guidance</h3>
            <p className="text-gray-400">Actionable recommendations for replacing vulnerable cryptographic implementations.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl hover:shadow-lg hover:bg-opacity-70 transition-all">
            <div className="w-12 h-12 bg-teal-600 bg-opacity-30 rounded-lg flex items-center justify-center mb-5">
              <FiServer size={24} className="text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Future-Proof Security</h3>
            <p className="text-gray-400">Stay ahead of quantum threats by ensuring your cryptography is quantum-resistant.</p>
          </div>
        </div>
      </section>

      {/* Education Hub Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="education-hub">
        <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Quantum Computing Education Hub</span>
            </h2>
            <p className="text-gray-300 mb-6">
              Learn the fundamentals of quantum computing and how it impacts cryptography with our interactive educational tools.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-1">
                  <span className="text-blue-300 text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-300">Interactive Shor's Algorithm demonstration</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-1">
                  <span className="text-blue-300 text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-300">Quantum bits (Qubits) visualization and explanation</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-1">
                  <span className="text-blue-300 text-sm">✓</span>
                </div>
                <p className="ml-3 text-gray-300">Post-quantum cryptography resources</p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                to="/education"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center"
              >
                Explore Education Hub <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-md opacity-75 animate-pulse"></div>
              <div className="relative bg-gray-900 p-5 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">Shor's Algorithm</h3>
                    <div className="h-20 w-full bg-purple-900 bg-opacity-20 rounded flex items-center justify-center">
                      <div className="text-xs text-purple-300 font-mono">f(x) = a^x mod N</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">Qubit States</h3>
                    <div className="h-20 w-full bg-blue-900 bg-opacity-20 rounded flex items-center justify-center">
                      <div className="text-xs text-blue-300 font-mono">|ψ⟩ = α|0⟩ + β|1⟩</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-indigo-400 mb-2">Bloch Sphere</h3>
                    <div className="h-20 w-full bg-indigo-900 bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full border border-indigo-400 relative">
                        <div className="absolute h-2 w-2 bg-indigo-500 rounded-full top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-teal-400 mb-2">Post-Quantum</h3>
                    <div className="h-20 w-full bg-teal-900 bg-opacity-20 rounded flex items-center justify-center">
                      <div className="text-xs text-teal-300 font-mono">Quantum-Safe</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-800 shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                Ready to quantum-proof your code?
                <span className="block text-blue-200 mt-1 text-2xl font-semibold">Start scanning today and prepare for the future.</span>
              </h2>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8 flex flex-shrink-0">
              <Link 
                to="/app" 
                className="flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all"
              >
                Get Started <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 bg-opacity-80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <img src="/images/logo-qvs.png" alt="QVS Logo" className="logo-qvs-footer" />
            <span className="ml-2 text-white">qvspro.net</span>
          </div>
          <div className="mt-6 md:mt-0 text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Quantum Vulnerability Scanner | <a href="https://qvspro.net" className="hover:underline">qvspro.net</a> | All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 