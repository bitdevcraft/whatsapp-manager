import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto mt-32 px-4 flex flex-col gap-8 pb-32">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <div>
        Welcome to Tasweeq Zone Digital (&quot;Company&quot;, &quot;we&quot;,
        &quot;our&quot;, or &quot;us&quot;). These Terms of Service
        (&quot;Terms&quot;) govern your use of our{" "}
        <Link href={"https://tasweequae.com"}>website</Link>, our services, and
        any associated products or platforms, including those integrated with
        Meta platforms such as WhatsApp Embedded Flows. By accessing or using
        our services, you agree to be bound by these Terms. If you do not agree,
        please do not use our services.
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">1. Services</h3>
        <div className="flex flex-col gap-6">
          <p>
            We provide digital marketing services including, but not limited to:
          </p>
          <ul className="list-disc ml-8">
            <li>Social Media Marketing and Management</li>
            <li>Lead Generation Campaigns</li>
            <li>SMS & Email Marketing</li>
            <li>Website Development</li>
            <li>SEO (Search Engine Optimization)</li>
            <li>Branding & Creative Design</li>
            <li>Mobile and Bluetooth Marketing</li>
          </ul>
          <p>
            These services may be accessed via our website or through
            third-party platforms we integrate with, including Meta
            technologies.
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">2. Use of Services</h3>
        <div className="flex flex-col gap-6">
          <p>
            You agree to use our services for lawful purposes only. You must
            not:
          </p>
          <ul className="list-disc ml-8">
            <li>Misuse our services in any way</li>
            <li>Interfere with our operations or networks</li>
            <li>Use our services to send spam or unauthorized marketing</li>
            <li>Impersonate another individual or organization</li>
          </ul>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">3. Privacy</h3>
        <div className="flex flex-col gap-6">
          <p>
            Your privacy is important to us. Please review our Privacy Policy
            (link to be added) to understand how we collect, use, and share your
            information.
          </p>
          <p>
            By using our services, including any interactions via WhatsApp or
            other Meta platforms, you consent to our collection and use of your
            information as described in our Privacy Policy.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">
          4. User Data &amp; Meta Integration
        </h3>
        <div className="flex flex-col gap-6">
          <p>
            When using services integrated with Meta platforms (e.g., WhatsApp
            Flows):
          </p>
          <ul className="list-disc ml-8">
            <li>
              We collect information such as name, contact details, and service
              preferences to provide personalized experiences.
            </li>
            <li>
              Data collected through Meta platforms is handled in compliance
              with Meta&lsquo;s policies and our Privacy Policy.
            </li>
            <li>
              We do not sell, rent, or misuse user data obtained through these
              platforms.
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">5. Intellectual Property</h3>
        <div className="flex flex-col gap-6">
          <p>
            All content, branding, and creative assets provided on our website
            or through our services remain the property of Tasweeq Digital
            Marketing Management unless otherwise stated. You may not copy,
            reproduce, or use our content without express permission.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">
          6. Disclaimer & Limitation of Liability
        </h3>
        <div className="flex flex-col gap-6">
          <p>
            Our services are provided “as is” without warranty of any kind. We
            are not liable for:
          </p>
          <ul className="list-disc ml-8">
            <li>
              Any direct or indirect damages arising from your use of our
              services
            </li>
            <li>
              Loss of business, data, or profits due to service interruptions or
              third-party platform issues (including Meta)
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">7. Modifications</h3>
        <div className="flex flex-col gap-6">
          <p>
            We reserve the right to update or modify these Terms at any time.
            Changes will be posted on this page with an updated effective date.
            Continued use of our services constitutes acceptance of the modified
            terms.
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h3 className="text-2xl font-bold">8. Contact Us</h3>
        <div className="flex flex-col gap-2">
          <p>
            If you have any questions or concerns regarding these Terms, please
            contact us at:
          </p>
          <p className="font-bold">Tasweeq Zone Digital</p>
          <ul className="ml-2">
            <li>
              <strong>Email:</strong> info@tasweequae.com
            </li>
            <li>
              <strong>Phone:</strong> +971 58 514 2884
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
