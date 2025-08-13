import React from "react";

export default function SupportCenter() {
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8 text-yellow-400">
      <h2 className="text-2xl font-bold mb-4">Support & Help Center</h2>

      <section className="mb-4">
        <h3 className="font-semibold mb-2">Frequently Asked Questions (FAQs)</h3>
        <ul className="list-disc list-inside text-gray-300">
          <li>How do I make an investment?</li>
          <li>What is the minimum investment?</li>
          <li>How can I withdraw funds?</li>
          <li>Is my investment secure?</li>
          {/* Add more questions as needed */}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Need More Help?</h3>
        <p className="mb-4 text-gray-300">
          For live chat support, click the button below or email support@wealthrun.com
        </p>
        <button
          onClick={() => alert("Live chat coming soon!")}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
        >
          Live Chat
        </button>
      </section>
    </div>
  );
}
