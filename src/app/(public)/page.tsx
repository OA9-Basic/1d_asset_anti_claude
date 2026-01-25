'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Menu, X, ShieldCheck, Zap, Users, PieChart, BookOpen, TrendingUp, Lock, Sparkles, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.3 },
};

// Magnetic Button Component
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

function MagneticButton({ children, className, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const button = ref.current;
    if (!button) return;

    const { left, top, width, height } = button.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.2;
    const y = (clientY - top - height / 2) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      {...(props as unknown as Parameters<typeof motion.button>[0])}
    >
      {children}
    </motion.button>
  );
}

// Floating Navbar
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50' : ''
      }`}
    >
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">AssetHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
            Home
          </Link>
          <Link href="/assets" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
            Browse
          </Link>
          <Link href="/assets/request" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
            Request
          </Link>
          <Link href="/assets/create" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
            Create
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/sign-in">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button
              size="sm"
              className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium py-2">
              Home
            </Link>
            <Link href="/assets" className="text-sm font-medium py-2">
              Browse
            </Link>
            <Link href="/assets/request" className="text-sm font-medium py-2">
              Request
            </Link>
            <Link href="/assets/create" className="text-sm font-medium py-2">
              Create
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Link href="/auth/sign-in">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

// Glass Card Dashboard Mockup
function GlassDashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, rotateY: -10 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="relative hidden lg:block"
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 blur-3xl rounded-3xl" />
      <Card className="relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-2xl w-80">
        {/* Dashboard Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Campaign Progress</p>
            <p className="text-xs text-zinc-500">Advanced React Course</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-600 dark:text-zinc-400">$8,450 raised</span>
            <span className="font-medium">84%</span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1 }}
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-lg font-bold text-violet-600">247</p>
            <p className="text-xs text-zinc-500">Backers</p>
          </div>
          <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-lg font-bold text-violet-600">12</p>
            <p className="text-xs text-zinc-500">Days left</p>
          </div>
          <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-lg font-bold text-violet-600">$34</p>
            <p className="text-xs text-zinc-500">Avg. pledge</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500">Recent Contributions</p>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="flex items-center gap-2 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                <Users className="w-3 h-3 text-zinc-500" />
              </div>
              <span className="flex-1">User contributed</span>
              <span className="font-medium">${[50, 25, 100][i - 1]}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// Hero Section
function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900" />
      <motion.div style={{ y, opacity }} className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-3xl" />
      <motion.div style={{ y, opacity }} className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-3xl" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Now in Public Beta</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Access Premium Assets,
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 blur-xl opacity-50" />
                <span className="relative bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Together.
                </span>
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-xl">
              Pool resources with thousands of creators to access premium courses, software, and digital products at a
              fraction of the cost. Contribute any amount — unlock permanent access together.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/auth/sign-up">
                <MagneticButton
                  className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link href="/assets">
                <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl font-medium border-2">
                  Browse Assets
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border-2 border-background flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">Trusted by 10,000+ creators</p>
                <p className="text-sm text-zinc-500">Join our growing community</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Glass Dashboard */}
          <GlassDashboardMockup />
        </div>
      </div>
    </section>
  );
}

// Live Stats Ticker
interface LiveStats {
  users: number;
  fundedAssets: number;
  totalCollected: number;
}

function LiveStatsTicker() {
  const [stats, setStats] = useState<LiveStats>({ users: 0, fundedAssets: 0, totalCollected: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            users: data.users || 0,
            fundedAssets: data.fundedAssets || 0,
            totalCollected: data.totalCollected || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                <CountUp end={stats.users} duration={2} separator="," />
              </p>
              <p className="text-sm text-zinc-500">Active Users</p>
            </div>
          </motion.div>

          <div className="hidden md:block w-px h-12 bg-zinc-200 dark:bg-zinc-800" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                <CountUp end={stats.fundedAssets} duration={2} separator="," />
              </p>
              <p className="text-sm text-zinc-500">Assets Funded</p>
            </div>
          </motion.div>

          <div className="hidden md:block w-px h-12 bg-zinc-200 dark:border-zinc-800" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${<CountUp end={stats.totalCollected} duration={2} separator="," decimals={0} />}
              </p>
              <p className="text-sm text-zinc-500">Total Volume</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Bento Grid Features
function BentoFeatures() {
  const features = [
    {
      icon: PieChart,
      title: 'Fractional Ownership',
      description: 'Contribute what you can — $1, $5, or $50. Every contribution counts toward unlocking the asset for everyone.',
      color: 'from-violet-500 to-indigo-500',
      size: 'col-span-1',
    },
    {
      icon: Users,
      title: 'Community Power',
      description: 'Join thousands of like-minded individuals. Together, we can access premium content that would be impossible alone.',
      color: 'from-blue-500 to-cyan-500',
      size: 'col-span-1',
    },
    {
      icon: ShieldCheck,
      title: 'Protected Payments',
      description: 'Your funds are held in escrow until the asset is funded and delivered. If it doesn\'t fund, you get your money back.',
      color: 'from-green-500 to-emerald-500',
      size: 'col-span-1 md:col-span-2',
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Once an asset is funded, get immediate access through our secure platform. No waiting, no hassle.',
      color: 'from-amber-500 to-orange-500',
      size: 'col-span-1',
    },
    {
      icon: BookOpen,
      title: 'Curated Quality',
      description: 'Community voting ensures only high-quality, in-demand assets make it to the funding stage.',
      color: 'from-pink-500 to-rose-500',
      size: 'col-span-1',
    },
    {
      icon: TrendingUp,
      title: 'Earn Rewards',
      description: 'Excess contributions automatically become investments. Earn from future sales of the asset.',
      color: 'from-purple-500 to-violet-500',
      size: 'col-span-1',
    },
  ];

  return (
    <section className="py-32 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Why Crowd-Fund Digital Assets?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Traditional pricing limits access. We break down barriers by pooling resources.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              whileHover={scaleOnHover}
              className={feature.size}
            >
              <Card className="h-full p-6 border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Interactive Timeline - How It Works
function HowItWorks() {
  const steps = [
    {
      icon: BookOpen,
      title: 'Browse Assets',
      description: 'Explore courses, software, and digital assets waiting to be funded by the community.',
    },
    {
      icon: Users,
      title: 'Contribute',
      description: 'Add any amount to help fund the asset. Every dollar brings us closer to the goal.',
    },
    {
      icon: Zap,
      title: 'Get Access',
      description: 'Once funded, all contributors get permanent access to the asset through our platform.',
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Start accessing premium assets in three simple steps
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Horizontal Layout for Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-violet-500/50 via-indigo-500/50 to-violet-500/50">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 origin-left"
              />
            </div>

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/25">
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border-2 border-violet-600 flex items-center justify-center text-sm font-bold text-violet-600">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Vertical Layout for Mobile */}
          <div className="md:hidden space-y-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/50 via-indigo-500/50 to-violet-500/50">
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-b from-violet-600 to-indigo-600 origin-top"
              />
            </div>

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative pl-20"
              >
                <div className="absolute left-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute left-10 top-0 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-violet-600 flex items-center justify-center text-xs font-bold text-violet-600">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">AssetHub</span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Community-powered platform for accessing premium digital assets together.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/assets" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Browse Assets
                </Link>
              </li>
              <li>
                <Link href="/assets/request" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Request Asset
                </Link>
              </li>
              <li>
                <Link href="/assets/create" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Create Campaign
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter & Copyright */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} AssetHub. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-64 h-10 bg-background border-zinc-200 dark:border-zinc-800"
              />
              <Button size="sm" className="h-10 px-4 bg-gradient-to-r from-violet-600 to-indigo-600">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-background" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-violet-600/10 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <Card className="relative overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardContent className="p-12 md:p-16 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Ready to Unlock Premium Assets?
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Join thousands of users already accessing premium courses, software, and digital content at a
                fraction of the cost.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 text-base font-medium"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium border-2">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>2 min setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Instant access</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Main Page Component
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <LiveStatsTicker />
        <BentoFeatures />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
