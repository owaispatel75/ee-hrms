import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { Mail, Lock, AlertTriangle, Lightbulb } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const { t } = useTranslation();
    const { logoLight, logoDark, themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
    const { props } = usePage();
    const globalSettings = (props as any).globalSettings;

    // Use a specific blue color to match the screenshot "Sign In" button (dark blue)
    // The screenshot has a dark blue button #1e3a8a (blue-900 approx)
    // The logo background is yellow-400 approx.

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-gray-50 dark:bg-zinc-950">
            <Head title={t("Log in")} />

            {/* Left Side - Hero Section (Hidden on Mobile) */}
            <div className="hidden lg:flex w-[60%] relative flex-col justify-between overflow-hidden bg-primary/5">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                        alt="Office Meeting"
                        className="w-full h-full object-cover blur-[2px] scale-105"
                    />
                    {/* Dark Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-blue-900/40 to-black/30" />
                </div>

                {/* Logo Area (Top Left) */}
                <div className="relative z-10 p-12">
                    <div className="bg-white rounded-md shadow-2xl shadow-black/20 ring-1 ring-black/5 overflow-hidden relative" style={{ width: '200px', height: '90px' }}>
                        {logoLight ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <img src={getImagePath(logoLight)} alt="Logo" className="max-h-full max-w-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-full h-full relative flex items-center justify-center pt-2">
                                {/* Reuse the styling from the original file for consistency, but simpler if needed */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-blue-50/50 rounded-full blur-sm"></div>
                                
                                <div className="relative z-10 font-bold text-primary text-2xl tracking-wide italic pl-1">
                                   EXPERT EDGE
                                </div>

                                <Lightbulb className="absolute bottom-2 right-2 text-yellow-500 w-6 h-6 stroke-[2.5]" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Hero Text (Bottom Left) */}
                <div className="relative z-10 p-16 mb-8">
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
                        Empowering Businesses <br />
                        with Strategic Insight
                    </h1>
                    <p className="text-xl text-gray-100 max-w-xl drop-shadow-md font-medium leading-relaxed">
                        We turn challenges into opportunities through expert guidance.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto bg-white dark:bg-zinc-900">
                <div className="w-full max-w-[450px] space-y-8">
                    
                    {/* Mobile Logo View (Hidden on Desktop) */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                         <div className="bg-white rounded-sm shadow-sm overflow-hidden relative mb-4 h-20 w-48 flex items-center justify-center">
                             {logoLight ? (
                                <img src={getImagePath(logoLight)} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                             ) : (
                                <span className="font-bold text-primary text-xl italic">EXPERT EDGE</span>
                             )}
                         </div>
                    </div>

                    {/* Header Text */}
                    <div className="text-center space-y-2 lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {t("Sign In")}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {t("Welcome back! Please enter your details.")}
                        </p>
                    </div>

                     {/* Alert/Status */}
                    {status && (
                        <div className="text-sm font-medium text-primary bg-primary/10 p-3 rounded-md">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Address */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm font-medium text-foreground">
                                {t("Email Address")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="pl-4 pr-10 w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-muted/30 h-11 text-foreground shadow-sm transition-all"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your.email@company.com"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground/70">
                                    <Mail className="h-5 w-5" />
                                </div>
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="block text-sm font-medium text-foreground">
                                    {t("Password")}
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="pl-4 pr-10 w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-muted/30 h-11 text-foreground shadow-sm transition-all"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={t("Enter your password")}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground/70">
                                    <Lock className="h-5 w-5" />
                                </div>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    className="border-gray-300 text-primary focus:ring-primary rounded-sm w-4 h-4"
                                />
                                <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer font-medium">
                                    {t("Remember me")}
                                </Label>
                            </div>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline"
                                >
                                    {t("Forgot password?")}
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full text-white bg-blue-900 hover:bg-blue-800 font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-2 text-base flex justify-center items-center"
                        >
                             {processing ? (
                                <span className="flex items-center gap-2">
                                     <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                     </svg>
                                     {t("Signing in...")}
                                </span>
                             ) : t("Sign In")}
                        </button>
                        
                         {/* Security Warning Box */}
                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                {t("This portal is accessible only from authorized office networks. External access is restricted for security.")}
                            </p>
                        </div>
                    </form>

                     {/* Footer */}
                     <div className="mt-8 text-center text-xs text-gray-400">
                        <p>&copy; 2026 {globalSettings?.brandName || 'ExpertEdge'}. {t("All rights reserved.")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
