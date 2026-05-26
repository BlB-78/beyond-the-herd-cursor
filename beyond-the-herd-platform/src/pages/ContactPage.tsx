import React from 'react';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400 mb-12">Have questions? We're here to help.</p>

        <form className="space-y-6 bg-zinc-900 border border-white/5 p-8 rounded-xl">
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
             <input type="text" className="w-full bg-black border border-white/10 rounded-md p-3 text-white focus:border-yellow-500 focus:outline-none" placeholder="Your name" />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
             <input type="email" className="w-full bg-black border border-white/10 rounded-md p-3 text-white focus:border-yellow-500 focus:outline-none" placeholder="your@email.com" />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
             <textarea rows={5} className="w-full bg-black border border-white/10 rounded-md p-3 text-white focus:border-yellow-500 focus:outline-none" placeholder="How can we help?"></textarea>
           </div>
           <button type="button" className="bg-yellow-500 text-black px-8 py-3 rounded-md font-bold hover:bg-yellow-400 transition-colors">
             Send Message
           </button>
        </form>
      </div>
    </div>
  );
}
