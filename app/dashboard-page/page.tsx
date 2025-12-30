"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Bell,
    HelpCircle,
    Rocket,
    Info,
    ClipboardList,
    Briefcase,
    CheckSquare,
    Fingerprint,
    BarChart3,
    Settings,
    Copyright,
} from "lucide-react";

import "./dashboard.css";

export default function DashboardPage() {
    return (
        <div className="bg-2025 min-h-screen relative text-slate-800">
            {/* Decorative shapes */}
            <div className="absolute top-16 left-20 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-24 w-56 h-56 bg-sky-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-0 w-24 h-24 bg-fuchsia-200/20 rounded-full blur-2xl"></div>

            {/* Navbar */}
            {/* <nav className="fixed top-0 left-0 w-full bg-white/60 backdrop-blur-md border-b border-slate-200 shadow-sm flex justify-between items-center px-6 py-3 z-50">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="text-indigo-500 w-6 h-6" />
                    <span className="font-semibold text-slate-800 text-lg tracking-tight">
                        SAS Portal
                    </span>
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                    <Bell className="w-5 h-5 hover:text-indigo-500 transition" />
                    <HelpCircle className="w-5 h-5 hover:text-indigo-500 transition" />
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-sm">Admin</span>
                        <img
                            src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=32"
                            className="rounded-full border border-indigo-200"
                        />
                    </div>
                </div>
            </nav> */}

            {/* Hero */}
            <section className="text-center mt-28 mb-12 px-6 relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 opacity-10">
                    <Rocket className="text-indigo-500 w-20 h-20" />
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                    Selamat Datang di{" "}
                    <span className="text-indigo-600">SAS Portal</span>
                </h1>

                <p className="text-slate-500 text-sm max-w-xl mx-auto flex items-center justify-center gap-1">
                    <Info className="text-indigo-400 w-4 h-4" />
                    Kelola aktivitas harian, proyek, dan absensi digital Anda.
                </p>
            </section>

            {/* Menu grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 w-full max-w-5xl mx-auto px-6 pb-16">
                {/* Daily Log */}
                <Link
                    href="/daily-report"
                    className="menu-card bg-white/70 border border-white/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                >
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-md mb-4">
                        <ClipboardList className="text-white w-10 h-10" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">
                        Daily Log
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                        Catat aktivitas harian
                    </p>
                </Link>

                {/* Project */}
                <Link
                    href="/projects"
                    className="menu-card bg-white/70 border border-white/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                >
                    <div className="p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md mb-4">
                        <Briefcase className="text-white w-10 h-10" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">
                        Project
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                        Pantau progres proyek
                    </p>
                </Link>

                {/* ToDo */}
                <Link
                    href="/to-do-list"
                    className="menu-card bg-white/70 border border-white/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                >
                    <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-md mb-4">
                        <CheckSquare className="text-white w-10 h-10" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">
                        ToDo
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                        Daftar tugas penting
                    </p>
                </Link>

                {/* Daftarkan Finger */}
                <Link
                    href="/finger-register"
                    className="menu-card bg-white/70 border border-white/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                >
                    <div className="p-4 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl shadow-md mb-4">
                        <Fingerprint className="text-white w-10 h-10" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">
                        Daftarkan Finger
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                        Aktivasi absensi digital
                    </p>
                </Link>

                {/* Dashboard */}
                <Link
                    href="/stats"
                    className="menu-card bg-white/70 border border-white/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                >
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl shadow-md mb-4">
                        <BarChart3 className="text-white w-10 h-10" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">
                        Dashboard
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                        Lihat statistik harian
                    </p>
                </Link>

                {/* Settings */}
                <Link
                    href="/settings"
                    className="menu-card bg-white/70 border border-white/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
                >
                    <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-md mb-4">
                        <Settings className="text-white w-10 h-10" />
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">
                        Pengaturan
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                        Atur akun & preferensi
                    </p>
                </Link>
            </div>

            {/* Footer */}
            <footer className="text-center text-slate-400 text-xs pb-6 flex justify-center items-center gap-2">
                <Copyright className="w-3 h-3" />
                <span>2025 BPK PENABUR Jakarta — Sistem Administrasi Sekolah</span>
            </footer>
        </div>
    );
}
