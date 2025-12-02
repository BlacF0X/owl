import React from 'react';
import { 
  X, AlertTriangle, Calendar, 
  ArrowUpRight, ArrowDownRight, Minus 
} from 'lucide-react';
import { SensorHistoryResponse } from './Co2Types';

interface HistoryModalProps {
  isOpen: boolean;
  historyData: SensorHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  historyData,
  isLoading,
  error,
  onClose,
}) => {
  if (!isOpen) return null;

  const sensorName = historyData?.sensor?.name || 'Chargement...';
  const sensorUnit = historyData?.sensor?.type?.unit || 'ppm';
  
  const allHistory = historyData?.history || [];
  
  const validValues = allHistory
    .map(h => Number(h.value))
    .filter(v => !isNaN(v));

  const count = validValues.length;
  const hasData = allHistory.length > 0;

  const latest = count > 0 ? validValues[0] : 0;
  const previous = count > 1 ? validValues[1] : latest;
  const min = count > 0 ? Math.min(...validValues) : 0;
  const max = count > 0 ? Math.max(...validValues) : 0;
  const avg = count > 0 ? Math.round(validValues.reduce((a, b) => a + b, 0) / count) : 0;

  const trend = latest - previous;
  const trendIcon = trend > 0 ? <ArrowUpRight className="h-4 w-4 text-red-500" /> : trend < 0 ? <ArrowDownRight className="h-4 w-4 text-green-500" /> : <Minus className="h-4 w-4 text-slate-400" />;
  const trendText = trend > 0 ? 'En hausse' : trend < 0 ? 'En baisse' : 'Stable';
  const trendColor = trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-slate-500';

  const goodCount = validValues.filter(v => v < 800).length;
  const mediumCount = validValues.filter(v => v >= 800 && v <= 1200).length;
  const badCount = validValues.filter(v => v > 1200).length;
  
  const goodPercent = count > 0 ? (goodCount / count) * 100 : 0;
  const mediumPercent = count > 0 ? (mediumCount / count) * 100 : 0;
  const badPercent = count > 0 ? (badCount / count) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 overflow-hidden z-[100000]">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Analyse détaillée</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
               <p className="text-sm font-medium text-slate-500">{sensorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-6">
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
              <p className="text-sm font-medium text-slate-500">Chargement...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100 mx-auto max-w-md">
              <p>Erreur : {error}</p>
            </div>
          )}

          {!isLoading && !error && !hasData && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Calendar className="h-12 w-12 mb-3 opacity-10" />
                <p className="font-medium">Aucune donnée brute reçue.</p>
             </div>
          )}

          {!isLoading && !error && hasData && (
            <div className="space-y-6">
              
              {count > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Moyenne</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{avg}</span>
                        <span className="text-xs text-slate-500">{sensorUnit}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Minimum</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-emerald-600">{min}</span>
                        <span className="text-xs text-slate-500">{sensorUnit}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Maximum</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-rose-600">{max}</span>
                        <span className="text-xs text-slate-500">{sensorUnit}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tendance</p>
                      <div className="flex items-center gap-2">
                        {trendIcon}
                        <span className={`text-sm font-bold ${trendColor}`}>{trendText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-800 mb-4">Qualité de l'air</h4>
                     <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100">
                        <div style={{ width: `${goodPercent}%` }} className="bg-emerald-500" title="Bonne"></div>
                        <div style={{ width: `${mediumPercent}%` }} className="bg-amber-500" title="Moyenne"></div>
                        <div style={{ width: `${badPercent}%` }} className="bg-rose-500" title="Critique"></div>
                     </div>
                     <div className="flex justify-between mt-3 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Excellente ({Math.round(goodPercent)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moyenne ({Math.round(mediumPercent)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critique ({Math.round(badPercent)}%)</div>
                     </div>
                  </div>
                </>
              )}

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Historique brut</h4>
                  <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
                    {allHistory.length} lignes
                  </span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-xs sticky top-0">
                        <tr>
                          <th className="px-6 py-3 w-1/2 bg-slate-50">Date & Heure</th>
                          <th className="px-6 py-3 w-1/2 text-right bg-slate-50">Valeur</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {allHistory.map((reading, index) => {
                          const valNum = Number(reading.value);
                          const isNum = !isNaN(valNum);
                          
                          return (
                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-3 text-slate-600 font-mono text-xs sm:text-sm">
                                {reading.timestamp 
                                  ? new Date(reading.timestamp).toLocaleString('fr-FR', {
                                      day: '2-digit', month: '2-digit', year: 'numeric',
                                      hour: '2-digit', minute: '2-digit'
                                    }) 
                                  : '-'}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                    isNum && valNum > 1200 ? 'bg-rose-100 text-rose-700' :
                                    isNum && valNum > 800 ? 'bg-amber-100 text-amber-700' :
                                    isNum ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'
                                  }`}>
                                  {isNum ? valNum : String(reading.value)} {isNum ? sensorUnit : ''}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border-t border-slate-100 p-4 flex justify-end z-10 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 hover:border-slate-400 font-medium transition-all shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
