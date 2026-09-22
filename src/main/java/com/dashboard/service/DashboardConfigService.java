package com.dashboard.service;

import com.dashboard.model.*;
import com.fasterxml.jackson.databind.DeserializationFeature;
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

    private final ObjectMapper objectMapper = new ObjectMapper()
            // A file saved before a card was removed still carries its key;
            // without this, startup would fail on the leftover property.
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

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
        for (String key : List.of("workforce", "events", "schedule", "personnel", "tasks", "countdown", "image")) {
            visibility.put(key, true);
        }

        WorkforceStatus workforce = new WorkforceStatus(142, 128, 8, 6, 0, 0);

        List<Appointment> keyPersonnel = List.of(
                new Appointment("Commanding Officer", "Lt Col A. Sharma"),
                new Appointment("Second-in-Command", "Maj R. Khanna"),
                new Appointment("Officer Maintenance", "Maj S. Mehta"),
                new Appointment("QM", "Capt K. Verma"),
                new Appointment("Training Officer", "Capt P. Singh"),
                new Appointment("Adjutant", "Capt N. Reddy"),
                new Appointment("Signals / IT", "Lt M. Iyer"),
                new Appointment("MT Officer", "Lt S. Gurung"),
                new Appointment("Safety Officer", "Capt A. Khan")
        );

        List<TaskProgress> projectStatus = List.of(
                new TaskProgress("Equipment Servicing", 80),
                new TaskProgress("Vehicle Maintenance", 65),
                new TaskProgress("Training Targets", 90),
                new TaskProgress("Documentation", 70),
                new TaskProgress("Infrastructure / Works", 60)
        );

        List<EventItem> upcomingEvents = List.of(
                new EventItem("2026-10-18", "Commanders' Conference", "Conference Hall", "red"),
                new EventItem("2026-10-21", "Annual Inspection (HQ)", "Unit Lines", "yellow"),
                new EventItem("2026-10-25", "Technical Training Workshop", "Training Area", "yellow"),
                new EventItem("2026-10-30", "Equipment Audit", "Workshop", "aqua"),
                new EventItem("2026-11-03", "Sports Meet", "Unit Grounds", "blue")
        );

        List<ScheduleItem> todaySchedule = List.of(
                new ScheduleItem("09:00 - 09:30", "Morning Brief", "Conference Hall"),
                new ScheduleItem("10:00 - 11:30", "Maintenance Review", "Tech Workshop"),
                new ScheduleItem("12:00 - 13:00", "Coord Meeting (Ops)", "Ops Room"),
                new ScheduleItem("14:00 - 15:30", "Training Planning", "Conference Hall"),
                new ScheduleItem("16:00 - 17:00", "Admin Review", "CO Office")
        );

        List<CountdownItem> deadlines = List.of(
                new CountdownItem("Annual Inspection", "2026-10-21", "red"),
                new CountdownItem("Sports Meet", "2026-11-03", "blue"),
                new CountdownItem("Raising Day", "2026-11-01", "aqua")
        );

        return new DashboardConfig(
                visibility,
                workforce,
                keyPersonnel,
                projectStatus,
                upcomingEvents,
                todaySchedule,
                deadlines
        );
    }
}
