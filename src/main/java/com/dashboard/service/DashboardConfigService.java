package com.dashboard.service;

import com.dashboard.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardConfigService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path dataFile = Path.of("data", "dashboard-data.json");

    private volatile DashboardConfig current;

    @PostConstruct
    public void init() throws IOException {
        if (Files.exists(dataFile)) {
            current = objectMapper.readValue(dataFile.toFile(), DashboardConfig.class);
        } else {
            current = defaultConfig();
            persist();
        }
    }

    public DashboardConfig get() {
        return current;
    }

    public synchronized DashboardConfig update(DashboardConfig newConfig) throws IOException {
        current = newConfig;
        persist();
        return current;
    }

    private void persist() throws IOException {
        Files.createDirectories(dataFile.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(dataFile.toFile(), current);
    }

    private DashboardConfig defaultConfig() {
        Map<String, Boolean> visibility = new LinkedHashMap<>();
        for (String key : List.of("workforce", "events", "schedule", "personnel", "notices", "tasks", "countdown", "quicklinks", "quote")) {
            visibility.put(key, true);
        }

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
                new EventItem("2026-09-18", "Board Meeting", "Conference Hall", "yellow"),
                new EventItem("2026-09-21", "Annual Audit (HQ)", "Finance Wing", "yellow"),
                new EventItem("2026-09-25", "Technical Training Workshop", "Training Area", "yellow"),
                new EventItem("2026-09-30", "Vendor Contract Review", "Workshop", "aqua"),
                new EventItem("2026-10-03", "Town Hall Meet", "Main Grounds", "blue")
        );

        List<Notice> announcements = List.of(
                new Notice("Submission of Q3 returns by 20 Sep 2026", "red"),
                new Notice("All teams to update leave plans for Oct 2026", "yellow"),
                new Notice("Asset maintenance logs to be completed by 18 Sep 2026", "yellow"),
                new Notice("Wellness check-up camp on 22 Sep 2026", "aqua"),
                new Notice("Dress code review next week - maintain formal attire", "aqua")
        );

        List<ScheduleItem> todaySchedule = List.of(
                new ScheduleItem("09:00 - 09:30", "Morning Stand-up", "Conference Hall"),
                new ScheduleItem("10:00 - 11:30", "Product Review", "Tech Workshop"),
                new ScheduleItem("12:00 - 13:00", "Ops Sync Meeting", "Ops Room"),
                new ScheduleItem("14:00 - 15:30", "Training Planning", "Conference Hall"),
                new ScheduleItem("16:00 - 17:00", "Admin Review", "CEO Office")
        );

        List<CountdownItem> deadlines = List.of(
                new CountdownItem("Annual Audit", "2026-09-21", "red"),
                new CountdownItem("Sales Summit", "2026-10-03", "blue"),
                new CountdownItem("Founders' Day", "2026-11-01", "aqua")
        );

        List<QuickLink> quickLinks = List.of(
                new QuickLink("Company Orders", "file", "#"),
                new QuickLink("Leave Portal", "plane", "#"),
                new QuickLink("SOPs / Manuals", "book", "#"),
                new QuickLink("Forms & Formats", "clipboard", "#"),
                new QuickLink("Emergency Contacts", "phone", "#")
        );

        Quote quote = new Quote("Discipline today, readiness tomorrow.", "Team Motto");

        return new DashboardConfig(
                visibility,
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
