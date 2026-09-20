package com.dashboard.model;

public record WorkforceStatus(
        int totalSanctioned,
        int present,
        int onLeave,
        int onFieldDuty,
        int remote,
        int vacant
) {
}
