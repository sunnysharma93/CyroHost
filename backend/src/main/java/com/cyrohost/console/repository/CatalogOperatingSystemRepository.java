package com.cyrohost.console.repository;

import com.cyrohost.console.entity.CatalogOperatingSystem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogOperatingSystemRepository extends JpaRepository<CatalogOperatingSystem, String> {
    List<CatalogOperatingSystem> findByActiveTrueOrderBySortOrderAsc();

    List<CatalogOperatingSystem> findAllByOrderBySortOrderAsc();
}
