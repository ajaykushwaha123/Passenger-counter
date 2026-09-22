package com.dashboard.model;

import java.util.List;
import java.util.Map;

/**
 * Field names are the storage contract - dashboards already saved by the admin
 * panel use these keys - so they stay put even where the card's heading on
 * screen differs (projectStatus is shown as "Task Status", and so on).
 */
public record DashboardConfig(
        Map<String, Boolean> visibility,
        WorkforceStatus workforce,
        List<Appointment> keyPersonnel,
        List<TaskProgress> projectStatus,
        List<EventItem> upcomingEvents,
        List<ScheduleItem> todaySchedule,
        List<CountdownItem> deadlines,
        Quote quoteOfTheDay
) {
}
