package com.dashboard.service;

import com.dashboard.model.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardDataService {

    public DashboardData getDashboardData() {
        WorkforceStatus workforce = new WorkforceStatus(142, 128, 8, 6, 0, 0);

        List<Appointment> keyPersonnel = List.of(
                new Appointment("Chief Executive Officer", "A. Whitfield"),
                new Appointment("Chief Operating Officer", "R. Menon"),
                new Appointment("Finance Director", "S. Kapoor"),
                new Appointment("Head of Product", "P. Alvarez"),
                new Appointment("Head of Engineering", "N. Reddy"),
                new Appointment("HR Manager", "L. Iyer"),
                new Appointment("IT / Systems Lead", "S. Gurung"),
                new Appointment("Compliance Officer", "A. Khan")
        );

        List<TaskProgress> projectStatus = List.of(
                new TaskProgress("Client Onboarding", 80),
                new TaskProgress("Platform Migration", 65),
                new TaskProgress("Q3 Sales Targets", 90),
                new TaskProgress("Documentation", 70),
                new TaskProgress("Infrastructure Upgrade", 60)
        );

        List<EventItem> upcomingEvents = List.of(
                new EventItem("18 Sep 2026", "Board Meeting", "Conference Hall", "amber"),
                new EventItem("21 Sep 2026", "Annual Audit (HQ)", "Finance Wing", "amber"),
                new EventItem("25 Sep 2026", "Technical Training Workshop", "Training Area", "amber"),
                new EventItem("30 Sep 2026", "Vendor Contract Review", "Workshop", "teal"),
                new EventItem("03 Oct 2026", "Town Hall Meet", "Main Grounds", "blue")
        );

        List<Notice> announcements = List.of(
                new Notice("Submission of Q3 returns by 20 Sep 2026", "red"),
                new Notice("All teams to update leave plans for Oct 2026", "amber"),
                new Notice("Asset maintenance logs to be completed by 18 Sep 2026", "amber"),
                new Notice("Wellness check-up camp on 22 Sep 2026", "green"),
                new Notice("Dress code review next week - maintain formal attire", "green")
        );

        List<ScheduleItem> todaySchedule = List.of(
                new ScheduleItem("09:00 - 09:30", "Morning Stand-up", "Conference Hall"),
                new ScheduleItem("10:00 - 11:30", "Product Review", "Tech Workshop"),
                new ScheduleItem("12:00 - 13:00", "Ops Sync Meeting", "Ops Room"),
                new ScheduleItem("14:00 - 15:30", "Training Planning", "Conference Hall"),
                new ScheduleItem("16:00 - 17:00", "Admin Review", "CEO Office")
        );

        List<CountdownItem> deadlines = List.of(
                new CountdownItem("Annual Audit", "21 Sep 2026", "red"),
                new CountdownItem("Sales Summit", "03 Oct 2026", "blue"),
                new CountdownItem("Founders' Day", "01 Nov 2026", "green")
        );

        List<QuickLink> quickLinks = List.of(
                new QuickLink("Company Orders", "file", "#"),
                new QuickLink("Leave Portal", "plane", "#"),
                new QuickLink("SOPs / Manuals", "book", "#"),
                new QuickLink("Forms & Formats", "clipboard", "#"),
                new QuickLink("Emergency Contacts", "phone", "#")
        );

        Quote quote = new Quote("Discipline today, readiness tomorrow.", "Team Motto");

        return new DashboardData(
                workforce,
                keyPersonnel,
                projectStatus,
                upcomingEvents,
                announcements,
                todaySchedule,
                deadlines,
                quickLinks,
                quote
        );
    }
}
