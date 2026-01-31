'use client';

import { ChevronLeft, ChevronRight, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FormNavigationProps {
  currentStep: number;
  isSubmitting: boolean;
  onBack: () => void;
}

export function FormNavigation({ currentStep, isSubmitting, onBack }: FormNavigationProps) {
  return (
    <div className="flex gap-3 pt-6 border-t">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-11"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      ) : (
        <Link href="/" className="flex-1">
          <Button type="button" variant="outline" disabled={isSubmitting} className="w-full h-11">
            Cancel
          </Button>
        </Link>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {currentStep === 3 ? 'Submitting...' : 'Processing...'}
          </>
        ) : (
          <>
            {currentStep === 3 ? (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Request
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
