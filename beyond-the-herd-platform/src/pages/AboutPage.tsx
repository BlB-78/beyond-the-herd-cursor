import React from 'react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-6 text-yellow-500">About Us</h1>
        <div className="prose prose-invert max-w-none text-gray-300">
          <p className="mb-4 text-lg">
            Beyond The Herd is dedicated to providing institutional-grade and elite education to traders looking to take their craft to the highest level.
          </p>
          <p className="mb-4">
            Founded by a collective of professional traders, our mission is to cut through the noise of lagging indicators and retail patterns. We focus solely on raw price action, strict risk management, and the mental fortitude required to survive and thrive in today's markets.
          </p>
          <p>
            Whether you are struggling to find consistency or you are preparing for a proprietary firm evaluation, our detailed courses, live execution sessions, and strong community are here to guide you every step of the way. Leave the herd. Trade with edge.
          </p>
        </div>
      </div>
    </div>
  );
}
