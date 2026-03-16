import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto mt-32 px-4 pb-32 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>

      <div>
        At Tasweeq Zone Digital (&quot;Company&quot;, &quot;we&quot;,
        &quot;our&quot;, or &quot;us&quot;), your privacy is our priority. This
        Privacy Policy explains how we collect, use, disclose,
        <Link href={"https://tasweequae.com"}>
          and safeguard your information when you interact with our website
        </Link>
        , our services, and third-party platforms we integrate with—including
        Meta platforms like WhatsApp.
      </div>
      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">1. Information We Collect</h3>
        <div className="flex flex-col gap-6">
          <p>We may collect the following types of information:</p>
          <p className="text-xl font-bold">a. Personal Information</p>
          <p>
            When you fill out a form, subscribe to a service, or interact with
            us via platforms like WhatsApp, we may collect:
          </p>
          <ul className="list-disc ml-8">
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Business or Company Name</li>
            <li>Service Preferences</li>
            <li>Any other information you provide voluntarily</li>
          </ul>
          <p className="text-xl font-bold">b. Automatically Collected Data</p>
          <p>Through cookies and analytics tools, we may also collect:</p>
          <ul className="list-disc ml-8">
            <li>IP address</li>
            <li>Device information</li>
            <li>Browser type</li>
            <li>Pages visited and time spent</li>
            <li>Referral sources</li>
          </ul>
          <p className="text-xl font-bold">
            c. WhatsApp and Meta Platform Data
          </p>
          <p>
            If you use our WhatsApp Flows or interact with us through Meta
            integrations, we may collect:
          </p>
          <ul className="list-disc ml-8">
            <li>Phone number</li>
            <li>Profile name</li>
            <li>Flow interaction details</li>
            <li>Conversation metadata (e.g., timestamps)</li>
          </ul>
          <p>
            We <strong>do not</strong> collect message content beyond what is
            necessary for the functionality of the flow or service requested.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">2. How We Use Your Information</h3>
        <div className="flex flex-col gap-6">
          <p>We use collected information to:</p>
          <ul className="list-disc ml-8">
            <li>Deliver and improve our digital marketing services</li>
            <li>Communicate with you (including via WhatsApp)</li>
            <li>Customize and personalize user experiences</li>
            <li>Respond to inquiries and provide customer support</li>
            <li>
              Send newsletters, promotions, and service updates (opt-in only)
            </li>
            <li>Comply with legal obligations and platform policies</li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">3. Data Sharing & Disclosure</h3>
        <div className="flex flex-col gap-6">
          <p>We do not sell, rent, or trade your personal data.</p>
          <p>We may share your data with:</p>
          <ul className="list-disc ml-8">
            <li>
              Service providers assisting in operations (e.g., CRM tools,
              hosting)
            </li>
            <li>
              Meta and its affiliated platforms as part of integrated services
            </li>
            <li>Legal authorities when required by law or legal process</li>
          </ul>
          <p>
            All third parties are bound by confidentiality and data protection
            agreements.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">4. Your Rights & Choices</h3>
        <div className="flex flex-col gap-6">
          <p>You have the right to:</p>
          <ul className="list-disc ml-8">
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent for communications or data processing</li>
            <li>Opt out of marketing communications at any time</li>
          </ul>
          <p>
            To make a request, please contact us at{" "}
            <Link href="mailto:info@tasweequae.com">info@tasweequae.com</Link>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">5. Data Retention</h3>
        <div className="flex flex-col gap-6">
          <p>
            We retain your information only as long as necessary to provide
            services, comply with legal obligations, or resolve disputes.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">6. Security</h3>
        <div className="flex flex-col gap-6">
          <p>
            We implement industry-standard security measures to protect your
            information. However, no online system is 100% secure. Please
            contact us immediately if you believe your data has been
            compromised.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">7. Third-Party Links</h3>
        <div className="flex flex-col gap-6">
          <p>
            Our website and messages may contain links to third-party websites.
            We are not responsible for their privacy practices. Please review
            their policies before sharing information.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">8. Changes to This Policy</h3>
        <div className="flex flex-col gap-6">
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated effective date.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">9. Contact Us</h3>
        <div className="flex flex-col gap-2">
          <p>
            For questions about this Privacy Policy or your data rights,
            contact:
          </p>
          <p className="font-bold">Tasweeq Zone Digital</p>
          <p>Dubai, UAE</p>
          <ul className="ml-2">
            <li>
              <strong>Email:</strong> info@tasweequae.com
            </li>
            <li>
              <strong>Phone:</strong> +971 52 402 1867
            </li>
            <li>
              <strong>Website:</strong> tasweequae.com
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
