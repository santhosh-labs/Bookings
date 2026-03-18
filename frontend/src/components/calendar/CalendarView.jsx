import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarView({ events, onEventClick }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
            <style>{`
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f1f5f9;
        }
        .fc .fc-button-primary {
          background-color: #4f46e5 !important;
          border-color: #4f46e5 !important;
          border-radius: 0.5rem;
          font-weight: 500;
          text-transform: capitalize;
          padding: 0.5rem 1rem;
        }
        .fc .fc-button-primary:hover {
          background-color: #4338ca !important;
          border-color: #4338ca !important;
        }
        .fc-col-header-cell-cushion {
          color: #475569;
          font-weight: 600;
          padding: 12px 0 !important;
        }
         .fc-daygrid-day-number {
          color: #1e293b;
          font-weight: 500;
          padding: 8px !important;
        }
        .fc-event {
          border: none !important;
          border-radius: 6px !important;
          padding: 2px 4px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .fc-event:hover {
          transform: translateY(-1px);
        }
        .fc-toolbar-title {
          font-weight: 700 !important;
          color: #0f172a !important;
          font-size: 1.5rem !important;
        }
      `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                eventClick={onEventClick}
                height="100%"
                dayMaxEvents={true}
                eventContent={(arg) => {
                    return (
                        <div className="bg-yellow-50 border border-orange-100 text-gray-900 px-2 py-1 rounded w-full overflow-hidden text-xs text-ellipsis whitespace-nowrap shadow-sm font-medium">
                            <b>{arg.timeText}</b> {arg.event.title}
                        </div>
                    );
                }}
            />
        </div>
    );
}

