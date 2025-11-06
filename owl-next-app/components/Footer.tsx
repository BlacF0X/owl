import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 py-16 text-center text-white sm:py-20" id="stats">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">À propos de nous</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-8">
          <div className="flex flex-col items-center">
            <h3 className="text-4xl">📧</h3>
            <p className="mt-2 text-slate-300">OwlProject@gmail.com</p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-4xl">📞</h3>
            <p className="mt-2 text-slate-300">+32 400/12.34.56</p>
          </div>
<div className="flex flex-col items-center">
            <h3 className="text-4xl">👥</h3>
            <Link href="/home/team" className="mt-2 text-slate-300 hover:text-white transition-colors">
            Notre équipe
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
