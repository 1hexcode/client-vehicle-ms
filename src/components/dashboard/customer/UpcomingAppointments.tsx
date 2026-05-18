"use client";

import { Wrench, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Appointment {
  serviceType: string;
  vehicleNumber: string;
  // API returns requestedAt; appointmentDate is a legacy alias
  requestedAt?: string;
  appointmentDate?: string;
  status: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold font-outfit">Upcoming Appointments</h3>
        <Link href="/customer/appointments" className="text-sm text-[#F97316] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
          View all <ChevronRight size={16} />
        </Link>
      </div>
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.slice(0, 3).map((appt, i) => (
            <div key={i} className="bg-[#141414] rounded-xl border border-[#222] p-5 flex items-center gap-4 hover:border-[#333] transition-colors">
              <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center shrink-0">
                <Wrench size={20} className="text-[#F97316]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{appt.serviceType || 'Service Appointment'}</h4>
                <p className="text-xs text-gray-500">{appt.vehicleNumber || 'Vehicle'} • {new Date(appt.requestedAt || appt.appointmentDate || '').toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                appt.status === 'Confirmed' ? 'bg-green-500/10 text-green-400' :
                appt.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {appt.status}
              </span>
              <ChevronRight size={18} className="text-gray-600" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141414] rounded-xl border border-[#222] p-10 text-center">
          <Calendar size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No upcoming appointments</p>
        </div>
      )}
    </div>
  );
}
