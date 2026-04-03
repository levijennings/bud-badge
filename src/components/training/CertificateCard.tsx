import React from 'react';
import { Award, AlertTriangle, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface CertificateCardProps {
  moduleName: string;
  score: number;
  dateEarned: Date;
  expiryDate?: Date;
  certificateNumber: string;
  isExpired?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  moduleName,
  score,
  dateEarned,
  expiryDate,
  certificateNumber,
  isExpired = false,
  onDownload,
  onShare,
  className,
}) => {
  const borderColor = isExpired ? 'border-red-500' : 'border-green-500';
  const bgGradient = isExpired
    ? 'from-red-50 to-red-100'
    : 'from-green-50 to-emerald-50';

  const isExpiringSoon = expiryDate
    ? new Date() > new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    : false;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card
      className={`${borderColor} border-2 overflow-hidden ${className || ''}`}
    >
      <div className={`bg-gradient-to-r ${bgGradient} p-6 relative`}>
        {/* Certificate background decoration */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Award className="w-24 h-24 text-current" />
        </div>

        <CardContent className="relative z-10 p-0">
          {/* Header with status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Certificate of Achievement
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {moduleName}
              </p>
            </div>

            {isExpired && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Expired
              </div>
            )}

            {!isExpired && isExpiringSoon && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Expiring Soon
              </div>
            )}

            {!isExpired && !isExpiringSoon && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <Award className="w-4 h-4" />
                Valid
              </div>
            )}
          </div>

          {/* Score */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm">Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{score}</span>
              <span className="text-lg text-gray-600">/100</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Earned on</p>
              <p className="font-semibold text-gray-900">
                {formatDate(dateEarned)}
              </p>
            </div>

            {expiryDate && (
              <div>
                <p className="text-gray-600 mb-1">
                  {isExpired ? 'Expired on' : 'Expires on'}
                </p>
                <p className={`font-semibold ${isExpired ? 'text-red-900' : 'text-gray-900'}`}>
                  {formatDate(expiryDate)}
                </p>
              </div>
            )}
          </div>

          {/* Certificate Number */}
          <div className="mb-6 p-3 bg-white bg-opacity-60 rounded border border-gray-300">
            <p className="text-xs text-gray-600 uppercase tracking-widest">
              Certificate Number
            </p>
            <p className="text-sm font-mono font-semibold text-gray-900">
              {certificateNumber}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-300">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

CertificateCard.displayName = 'CertificateCard';
