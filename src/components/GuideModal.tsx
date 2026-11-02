import React from 'react';
import { X, CheckCircle2, ShieldAlert, Award } from 'lucide-react';
import { SP_DETAILS } from '../data/questions';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-none select-none">
      <div className="max-w-2xl w-full max-h-[88vh] bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 overflow-y-auto text-left shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Panduan Math Obby</h2>
            <p className="text-xs text-slate-400">Kurikulum Matematik Tingkatan 1 (DSKP 4.4 Nisbah, Kadar dan Kadaran)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Standard Pembelajaran Details */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          <span>4 Standard Pembelajaran & Mekanik Halangan 3D</span>
        </h3>

        <div className="space-y-3 mb-6">
          {Object.entries(SP_DETAILS).map(([key, item]) => (
            <div key={key} className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold text-white ${item.badgeColor}`}>
                  {key}
                </span>
                <span className="font-bold text-sm text-slate-200">{item.title.split('—')[1]}</span>
              </div>
              <p className="text-xs text-slate-300 mb-1.5"><strong className="text-slate-400">Kemahiran:</strong> {item.skill}.</p>
              <div className="text-[11px] text-sky-300 bg-sky-950/40 p-2 rounded-lg border border-sky-800/40">
                <strong>Mekanik 3D:</strong>{' '}
                {key === 'SP 4.4.1' && 'Laluan jubin lompatan statik mesra murid dengan saiz luas dan jarak lompatan pendek yang mudah dikawal!'}
                {key === 'SP 4.4.2' && 'Laluan sempit mengelak bebola api membara. Manfaatkan zon selamat di sisi laluan untuk mara!'}
                {key === 'SP 4.4.3' && 'Cabaran koordinasi masa melepasi 2 palang laser berputar di setiap tiang dan lompat melepasi palang laser rendah!'}
                {key === 'SP 4.4.4' && 'Lantai sarang lebah yang runtuh 1.4 saat selepas dipijak dan mengelak bongkah siling di atas lahar panas!'}
              </div>
            </div>
          ))}
        </div>

        {/* Scoring & Penalties */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Sistem Nyawa Infiniti, Markah & Pendedahan Jawapan</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-6 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-500/30">
            <div className="font-bold text-emerald-400 mb-1">+100 MATA (Tepat)</div>
            Markah +100 mata sentiasa diberikan bagi setiap jawapan betul, termasuk selepas mengulang semula pusingan!
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-rose-500/30">
            <div className="font-bold text-rose-400 mb-1">ULANG SEMULA (Jawapan Salah)</div>
            Jawapan sebenar & penerangan konsep didedahkan untuk kefahaman murid. Pemain dihantar semula ke titik mula pusingan.
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-amber-500/30">
            <div className="font-bold text-amber-400 mb-1">ULANG SEMULA (Masa / Terjatuh)</div>
            Masa 25s tamat atau terjatuh menghantar semula ke titik mula pusingan untuk mencuba semula tanpa had.
          </div>
        </div>

        {/* Infinite Lives Obby */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex items-start gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-white block mb-0.5">Sistem Ketahanan Nyawa Infiniti (♾️):</strong>
            Pemain dibekalkan nyawa infiniti (tanpa had) untuk mencuba semula tanpa sekatan Game Over sehingga berjaya menguasai semua konsep soalan matematik dan menamatkan obby!
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md"
        >
          FAHAM & TUTUP
        </button>
      </div>
    </div>
  );
};
