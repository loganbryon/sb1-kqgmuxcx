import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, TrendingUp, FileText, Zap, Users, Target } from 'lucide-react';

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'PLC Automation Suite',
      subtitle: 'Streamlining Industrial Control Documentation',
      color: 'from-blue-600 to-blue-800',
      icon: Zap,
    },
    {
      title: 'The Challenge',
      subtitle: 'Managing complex automation projects manually',
      points: [
        'Scattered documentation across multiple files and formats',
        'Difficult to track I/O points and their relationships',
        'Manual Modbus register mapping is time-consuming and error-prone',
        'Documentation updates require rework across multiple documents',
        'Knowledge silos within the team',
      ],
      color: 'from-orange-500 to-orange-700',
    },
    {
      title: 'Introducing: PLC Automation Suite',
      subtitle: 'A centralized platform for industrial automation documentation',
      points: [
        'Unified project workspace for all automation data',
        'Comprehensive I/O point management with full traceability',
        'Integrated Modbus register mapping tools',
        'Cause-Effect matrix for logic documentation',
        'Communication port configuration management',
        'Secure cloud-based storage with user authentication',
      ],
      color: 'from-emerald-500 to-emerald-700',
      highlight: true,
    },
    {
      title: 'Key Benefits for Small Companies',
      subtitle: 'Why this tool matters for your team',
      benefits: [
        {
          icon: TrendingUp,
          title: 'Faster Project Delivery',
          description: 'Reduce documentation time by 60%, allowing teams to focus on engineering',
        },
        {
          icon: FileText,
          title: 'Professional Documentation',
          description: 'Generate standardized, audit-ready documentation instantly',
        },
        {
          icon: Users,
          title: 'Better Collaboration',
          description: 'Team members access the same source of truth in real-time',
        },
        {
          icon: Target,
          title: 'Reduced Errors',
          description: 'Eliminate manual data entry mistakes and version conflicts',
        },
      ],
      color: 'from-purple-600 to-purple-800',
    },
    {
      title: 'Streamlined Documentation Process',
      subtitle: 'Before vs. After',
      comparison: {
        before: [
          'Create Excel spreadsheets for I/O mapping',
          'Manual word processor documentation',
          'Email back-and-forth for updates',
          'Recreate documentation for each project',
          'Track changes in email threads',
        ],
        after: [
          'Central database for all I/O points',
          'Auto-generated professional documents',
          'Real-time collaborative updates',
          'Template-based project creation',
          'Complete audit trail built-in',
        ],
      },
      color: 'from-indigo-600 to-indigo-800',
    },
    {
      title: 'Future-Ready Platform',
      subtitle: 'Extensibility & Growth',
      features: [
        {
          title: 'P&ID Drawings Integration',
          description: 'Upload and link P&ID diagrams directly to I/O points and control logic',
        },
        {
          title: 'Visual Logic Designer',
          description: 'Drag-and-drop interface for creating cause-effect relationships',
        },
        {
          title: 'Export to Engineering Tools',
          description: 'Direct export to PLC programming environments',
        },
        {
          title: 'Mobile Access',
          description: 'Review documentation on-site with mobile app support',
        },
        {
          title: 'Version Control',
          description: 'Track all changes and manage multiple project versions',
        },
        {
          title: 'Integration APIs',
          description: 'Connect with external systems and data sources',
        },
      ],
      color: 'from-cyan-600 to-cyan-800',
    },
    {
      title: 'ROI & Timeline',
      subtitle: 'Expected outcomes',
      metrics: [
        { label: 'Time Saved Per Project', value: '40-60 hours', color: 'bg-green-500' },
        { label: 'Documentation Accuracy', value: '99%', color: 'bg-blue-500' },
        { label: 'Team Onboarding Time', value: '50% reduction', color: 'bg-purple-500' },
        { label: 'Project Payoff Period', value: '3-6 months', color: 'bg-orange-500' },
      ],
      color: 'from-rose-600 to-rose-800',
    },
    {
      title: 'Next Steps',
      subtitle: 'Implementation Plan',
      steps: [
        { number: '1', title: 'Team Training', description: 'Get everyone familiar with the platform (1 week)' },
        { number: '2', title: 'Pilot Project', description: 'Test with one active project (2-3 weeks)' },
        { number: '3', title: 'Feedback & Refinement', description: 'Gather team input and optimize workflows (1 week)' },
        { number: '4', title: 'Full Rollout', description: 'Migrate all existing projects and establish best practices' },
      ],
      color: 'from-teal-600 to-teal-800',
    },
    {
      title: 'Questions?',
      subtitle: 'Let\'s build the future of automation documentation together',
      color: 'from-slate-700 to-slate-900',
    },
  ];

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const nextSlide = () => {
    if (!isLastSlide) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (!isFirstSlide) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className={`flex-1 bg-gradient-to-br ${slide.color} flex items-center justify-center p-8`}>
        <div className="max-w-4xl w-full text-white">
          {/* Title Slide */}
          {slide === slides[0] && (
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <div className="p-6 bg-white/20 rounded-full">
                  <Zap size={80} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-2xl text-white/90">{slide.subtitle}</p>
              </div>
            </div>
          )}

          {/* Challenge & Introduction Slides */}
          {(slide === slides[1] || slide === slides[2]) && (
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
              <ul className="space-y-4">
                {slide.points?.map((point, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <CheckCircle size={24} className="flex-shrink-0 mt-1" />
                    <span className="text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits Slide */}
          {slide === slides[3] && (
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slide.benefits?.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <IconComponent size={32} className="flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                          <p className="text-white/80">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison Slide */}
          {slide === slides[4] && (
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-red-200">❌ Old Process</h3>
                  <ul className="space-y-3">
                    {slide.comparison?.before.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-red-300 font-bold">✗</span>
                        <span className="text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-green-200">✅ New Process</h3>
                  <ul className="space-y-3">
                    {slide.comparison?.after.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-300 font-bold">✓</span>
                        <span className="text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Future Features Slide */}
          {slide === slides[5] && (
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slide.features?.map((feature, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-5 hover:bg-white/20 transition-colors">
                    <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROI Slide */}
          {slide === slides[6] && (
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {slide.metrics?.map((metric, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors">
                    <div className={`${metric.color} text-white rounded-lg py-4 px-3 mb-3 font-bold text-2xl`}>
                      {metric.value}
                    </div>
                    <p className="text-sm font-semibold">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Slide */}
          {slide === slides[7] && (
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
              <div className="space-y-4">
                {slide.steps?.map((step, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-1">{step.title}</h4>
                      <p className="text-white/80">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions Slide */}
          {slide === slides[8] && (
            <div className="text-center space-y-8">
              <div>
                <h2 className="text-6xl font-bold mb-4">{slide.title}</h2>
                <p className="text-2xl text-white/90">{slide.subtitle}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 inline-block">
                <p className="text-lg">Thank you for your attention!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 text-white px-8 py-4 flex items-center justify-between">
        <button
          onClick={prevSlide}
          disabled={isFirstSlide}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="text-center">
          <p className="text-sm font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </p>
          <div className="flex gap-2 justify-center mt-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          disabled={isLastSlide}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
