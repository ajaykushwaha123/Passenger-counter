package com.dashboard.model;

import java.util.List;
import java.util.Map;

public record DashboardConfig(
        Map<String, Boolean> visibility,
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
