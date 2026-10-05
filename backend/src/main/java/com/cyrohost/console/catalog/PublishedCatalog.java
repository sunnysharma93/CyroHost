package com.cyrohost.console.catalog;

import java.util.List;
import java.util.Optional;

public final class PublishedCatalog {

    private PublishedCatalog() {
    }

    public record Plan(String id, String name, String price, int cpu, int ramGb, int diskGb, String transfer, String port, boolean windows) {
    }

    public record Region(String id, String name, String note) {
    }

    public record OsTemplate(String id, String name, String note) {
    }

    public static final List<Plan> PLANS = List.of(
            new Plan("nano", "Nano", "₹604", 1, 1, 48, "5 TB", "1 Gbps", false),
            new Plan("micro", "Micro", "₹806", 2, 2, 48, "5 TB", "10 Gbps", true),
            new Plan("small", "Small", "₹1,009", 2, 4, 48, "5 TB", "10 Gbps", true),
            new Plan("medium", "Medium", "₹1,590", 4, 8, 48, "2 TB", "10 Gbps", true),
            new Plan("large", "Large", "₹2,168", 4, 16, 48, "10 TB", "10 Gbps", true),
            new Plan("xlarge", "XLarge", "₹2,554", 8, 16, 48, "10 TB", "10 Gbps", true),
            new Plan("2xlarge", "2XLarge", "₹3,903", 8, 32, 48, "20 TB", "10 Gbps", true),
            new Plan("3xlarge", "3XLarge", "₹4,867", 16, 32, 48, "20 TB", "10 Gbps", true),
            new Plan("4xlarge", "4XLarge", "₹7,758", 32, 64, 48, "20 TB", "10 Gbps", true)
    );

    public static final List<Region> REGIONS = List.of(
            new Region("india", "India", "Published compute region. The public pages do not name a city for the VPS region."),
            new Region("singapore", "Singapore", "Published compute region. No city-level hall is claimed."),
            new Region("united-states", "United States", "On request. Not instant deploy, and no capacity figure is published.")
    );

    public static final List<OsTemplate> OPERATING_SYSTEMS = List.of(
            new OsTemplate("linux", "Linux", "Listed on every published VPS size. A specific image name is confirmed at order time."),
            new OsTemplate("windows", "Windows Server", "Listed on every published size except Nano. Availability is confirmed before an order.")
    );

    public static Optional<Plan> plan(String id) {
        return PLANS.stream().filter(item -> item.id().equals(id)).findFirst();
    }

    public static Optional<Region> region(String id) {
        return REGIONS.stream().filter(item -> item.id().equals(id)).findFirst();
    }

    public static Optional<OsTemplate> os(String id) {
        return OPERATING_SYSTEMS.stream().filter(item -> item.id().equals(id)).findFirst();
    }
}
