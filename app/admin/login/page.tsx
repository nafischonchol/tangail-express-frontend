import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-md px-6">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl mb-6 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-500 hover:scale-110">
                        <KeyRound className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">Admin Portal</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Enter your credentials to access your admin account</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                    <LoginForm />

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Request access
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
