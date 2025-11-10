import React from 'react';
import Link from 'next/link';
import { Mail, Users } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white" id="contact">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">À propos de nous</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Une équipe passionnée, dédiée à vous aider à mieux comprendre votre environnement.
          </p>
        </div>

        {/* Conteneur pour les liens de contact */}
        <div className="mt-10 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
          {/* Lien Mailto pour l'email */}
          <a
            href="mailto:team.owl.project@proton.me"
            className="group flex items-center gap-3 text-slate-300 transition-colors hover:text-white"
          >
            <Mail className="h-6 w-6 text-slate-400 transition-colors group-hover:text-white" />
            <span>team.owl.project@proton.me</span>
          </a>

          {/* Lien vers la page de l'équipe */}
          <Link
            href="/home/team"
            className="group flex items-center gap-3 text-slate-300 transition-colors hover:text-white"
          >
            <Users className="h-6 w-6 text-slate-400 transition-colors group-hover:text-white" />
            <span>Notre équipe</span>
          </Link>
        </div>

        {/* Copyright en bas */}
        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Project OwL. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
