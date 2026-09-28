'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, MoveRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/checkbox';
import { loginAdmin } from '@/lib/api/auth';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await loginAdmin(email, password);
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'A network error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 ml-1">Email Address</Label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10">
                        <Mail className="w-5 h-5" />
                    </div>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-2xl focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 focus-visible:ring-2 transition-all duration-300"
                        placeholder="name@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        Forgot password?
                    </Link>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10">
                        <Lock className="w-5 h-5" />
                    </div>
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-2xl focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 focus-visible:ring-2 transition-all duration-300"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors z-10"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-3 pt-2 group">
                <Checkbox 
                    id="remember" 
                    className="border-slate-700 bg-slate-900/50 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 group-hover:border-indigo-500/50 transition-colors"
                />
                <Label
                    htmlFor="remember"
                    className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Remember me for 30 days
                </Label>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 group text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : null}
                {isLoading ? 'Signing In...' : 'Sign In'}
                {!isLoading && <MoveRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
        </form>
    );
}
