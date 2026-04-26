"use client";

import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

interface Appointment {
  time: string;
  customer: string;
  car: string;
  service: string;
}

interface DailyQueueProps {
  appointments: Appointment[];
}

export default function DailyQueue({ appointments }: DailyQueueProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-outfit">Today&apos;s Appointments</h3>
        <button className="text-sm text-[#F97316] font-semibold inline-flex items-center gap-1">
          Manage Queue <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {appointments.map((appt, i) => (
          <div key={i} className="bg-[#141414] rounded-xl border border-[#222] p-6 hover:border-[#333] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1 rounded-full text-gray-400">
                <Clock size={12} />
                <span className="text-xs font-semibold">{appt.time}</span>
              </div>
              <button className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors">
                <CheckCircle2 size={18} />
              </button>
            </div>
            <h4 className="font-bold text-sm mb-1">{appt.customer}</h4>
            <p className="text-xs text-gray-500">{appt.car}</p>
            <div className="mt-4 pt-4 border-t border-[#222] text-sm font-semibold text-[#F97316]">{appt.service}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
