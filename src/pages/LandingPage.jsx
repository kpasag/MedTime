// import './LandingPage.css';

function LandingPage() {
  return (
    <main className="bg-[#90D5FF]">
      <section className="bg-[url('../assets/ChatGPT Image Jan 17, 2026, 03_54_04 PM.png')] bg-cover bg-center bg-no-repeat h-screen w-full flex justify-center items-center flex-col text-white text-center p-4 rounded-lg border-2 border-green-500">
        <h1>Welcome to MedTime</h1>
        <p>The best way to manage your prescriptions and medications</p>
        <button>Get Started</button>
      </section>
      <section>
        <h2>Features</h2>
        <ul>
          <li>Manage your prescriptions and medications</li>
          <li>Get reminders for your medications</li>
          <li>View your prescription history</li>
        </ul>
      </section>
      <section>
        <h2>About Us</h2>
        <p>We are a team of developers who are passionate about creating a better way to manage your prescriptions and medications</p>
      </section>
      <section>
        <h2>Contact Us</h2>
        <p>Email: info@medtime.com</p>
      </section>
      <section>
        <h2>Follow Us</h2>
        <ul>
          <li>Facebook</li>
          <li>Twitter</li>
          <li>Instagram</li>
        </ul>
      </section>
      <section>
        <h2>Pricing</h2>
        <p>We offer a free plan and a paid plan. The free plan allows you to manage up to 10 prescriptions and medications. The paid plan allows you to manage unlimited prescriptions and medications.</p>
      </section>
      <section>
        <h2>Testimonials</h2>
        <p>What our users are saying about us</p>
      </section>
    </main>
  );
}

export default LandingPage;
