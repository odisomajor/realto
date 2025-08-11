import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Xillix Real Estate. These Terms and Conditions ("Terms") govern your use of our website, mobile application, and services (collectively, the "Service") operated by Xillix Real Estate ("we," "us," or "our").
              </p>
              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Xillix Real Estate provides an online platform that connects property buyers, sellers, renters, and real estate professionals. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Property listings and search functionality</li>
                <li>Agent and broker profiles and contact services</li>
                <li>Property valuation tools and market insights</li>
                <li>Communication tools between users</li>
                <li>Educational resources and market information</li>
                <li>Transaction facilitation services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To access certain features of our Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct and Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                <li>Post false, misleading, or fraudulent property information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Spam or send unsolicited communications</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or collect data from our Service</li>
                <li>Infringe on intellectual property rights</li>
                <li>Engage in any activity that disrupts or interferes with the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Property Listings and Content</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Listing Accuracy</h3>
              <p className="text-gray-700 mb-4">
                Users who post property listings are solely responsible for the accuracy and completeness of their listings. We do not verify the accuracy of property information and make no representations or warranties regarding such information.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Content Ownership</h3>
              <p className="text-gray-700 mb-4">
                By posting content on our Service, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with our Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.3 Content Removal</h3>
              <p className="text-gray-700">
                We reserve the right to remove any content that violates these Terms or is otherwise objectionable at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Real Estate Transactions</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Facilitation Only</h3>
              <p className="text-gray-700 mb-4">
                We provide a platform to facilitate real estate transactions but are not a party to any agreements between users. All transactions are between the relevant parties (buyers, sellers, agents, etc.).
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Professional Advice</h3>
              <p className="text-gray-700 mb-4">
                We recommend that users seek professional legal, financial, and real estate advice before entering into any property transactions.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.3 Due Diligence</h3>
              <p className="text-gray-700">
                Users are responsible for conducting their own due diligence on properties and verifying all information independently.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Fees and Payments</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 Service Fees</h3>
              <p className="text-gray-700 mb-4">
                Certain features of our Service may require payment of fees. All fees are non-refundable unless otherwise specified.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 Payment Terms</h3>
              <p className="text-gray-700 mb-4">
                Payment is due immediately upon purchase. We accept various payment methods as indicated on our platform.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.3 Fee Changes</h3>
              <p className="text-gray-700">
                We reserve the right to change our fees at any time with reasonable notice to users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are owned by Xillix Real Estate and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of our content without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy Policy</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitation of Liability</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">10.1 Service Disclaimer</h3>
              <p className="text-gray-700 mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, regarding the Service or any content therein.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">10.2 Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                To the fullest extent permitted by law, Xillix Real Estate shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">10.3 Maximum Liability</h3>
              <p className="text-gray-700">
                Our total liability to you for all damages shall not exceed the amount paid by you to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700">
                You agree to defend, indemnify, and hold harmless Xillix Real Estate and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
              </p>
              <p className="text-gray-700">
                Upon termination, your right to use the Service will cease immediately, but the provisions of these Terms that by their nature should survive termination shall remain in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">13.1 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">13.2 Jurisdiction</h3>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Kenya.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">13.3 Alternative Dispute Resolution</h3>
              <p className="text-gray-700">
                Before pursuing formal legal action, parties agree to attempt resolution through good faith negotiation and, if necessary, mediation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms constitute the entire agreement between you and Xillix Real Estate regarding the use of the Service and supersede all prior agreements and understandings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Xillix Real Estate</strong></p>
                <p className="text-gray-700">Email: legal@xillix.com</p>
                <p className="text-gray-700">Phone: +254 700 000 000</p>
                <p className="text-gray-700">Address: Nairobi, Kenya</p>
                <p className="text-gray-700">Website: www.xillix.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}