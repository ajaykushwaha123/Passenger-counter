package com.dashboard.model;

import java.util.List;

public record DashboardData(
        WorkforceStatus workforce,
        List<Appointment> keyPersonnel,
        List<TaskProgress> projectStatus,
        List<EventItem> upcomingEvents,
        List<Notice> announcements,
        List<ScheduleItem> todaySchedule,
        List<CountdownItem> deadlines,
        List<QuickLink> quickLinks,
        Quote quoteOfTheDay
) {
}
