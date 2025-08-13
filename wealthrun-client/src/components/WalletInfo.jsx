// src/components/WalletInfo.jsx
import React from "react";
import { QRCode } from "react-qrcode-logo";

const wallets = {
  BTC: "bc1q54dvqs9rtk992tzjew0cdv8uyc9k9ge03nep92",
  ETH: "0x07aFDEdB27db01Af05967E547fA10C3642Eacb63",
  USDT: "0x07aFDEdB27db01Af05967E547fA10C3642Eacb63",
};

export default function WalletInfo() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Wallet address copied to clipboard!");
  };

  return (
    <div className="bg-gray-900 bg-opacity-80 rounded-lg p-6 shadow-lg max-w-4xl mx-auto mt-12 text-white">
      <h2 className="text-yellow-400 text-2xl font-bold mb-6">Platform Wallet Addresses</h2>
      <p className="mb-4 text-gray-300">
        Please fund your investments by sending your chosen crypto to one of the following wallets:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(wallets).map(([coin, address]) => (
          <div key={coin} className="bg-gray-800 p-4 rounded-lg text-center">
            <h3 className="text-yellow-400 text-xl font-semibold mb-2">{coin} Wallet</h3>
            <QRCode value={address} size={120} fgColor="#FFD700" bgColor="#1F2937" />
            <p className="break-all mt-4">{address}</p>
            <button
              onClick={() => copyToClipboard(address)}
              className="mt-2 px-4 py-1 bg-yellow-500 rounded text-black hover:bg-yellow-400 transition"
            >
              Copy Address
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-900 p-4 rounded text-yellow-100">
        <h3 className="font-bold mb-2">How to fund your investment:</h3>
        <ol className="list-decimal list-inside text-gray-300">
          <li>Select your investment plan and amount in the dashboard.</li>
          <li>Send the corresponding crypto amount to the wallet address above for your chosen coin.</li>
          <li>Once payment is sent, return to the dashboard and click "Confirm Payment".</li>
          <li>Your investment will be verified and activated shortly.</li>
          <li>For any issues, contact support at support@wealthrun.com.</li>
        </ol>
      </div>
    </div>
  );
}
