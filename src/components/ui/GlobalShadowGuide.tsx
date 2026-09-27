'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface GlobalShadowGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalShadowGuide({ isOpen, onClose }: GlobalShadowGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Top Navigation Bar',
      text: 'Fast shortcuts to your most critical SEO workflows: Rankings, Website Audit (Projects), All Locations, All Projects, Backlink Gap Analyzer, Local Rankings, and Reviews.',
      position: 'top-14 left-1/4',
    },
    {
      title: 'Left Rail Navigation',
      text: 'Seamlessly switch between core suites: Projects, Research, Backlinks, Audit, AI Search, Content Marketing, Local Marketing, Report Builder, Agency Pack, and SMM.',
      position: 'top-28 left-24',
    },
    {
      title: 'Active Project Domain',
      text: 'Switch active websites or add new projects directly from the dropdown to monitor keyword positions, organic traffic changes, and backlinks.',
      position: 'top-20 left-72',
    },
    {
      title: 'Report Builder & Templates',
      text: 'Create custom PDF, HTML, or XLS reports using modular sections or select from 12 preconfigured templates. Set up scheduled delivery to clients or colleagues.',
      position: 'top-44 left-1/3',
    },
    {
      title: '10% Trial Discount Coupon',
      text: 'Your trial includes a personal 10% discount on any annual or monthly plan. Click the pink floating tab anytime to view your timer and copy code ABT10NK.',
      position: 'top-1/2 right-16',
    },
  ];

  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    onClose();
    setCurrentStep(0);
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        onClick={handleCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Popover Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Quick-start Guide • Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <h4 className="text-base font-bold text-[#171B24] mb-2">{step.title}</h4>
          <p className="text-xs text-[#5B6370] leading-relaxed">{step.text}</p>
        </div>

        {/* Action Controls matching SE Ranking's globalShadowBlockContentBtn */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={isFirst}
            className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleNext}
              className={`px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLast
                  ? 'bg-[#10B981] hover:bg-[#059669] text-white'
                  : 'bg-[#0B69FF] hover:bg-[#005FE0] text-white'
              }`}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Start working</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
