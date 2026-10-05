package com.cyrohost.console.repository;

import com.cyrohost.console.entity.CatalogRegion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogRegionRepository extends JpaRepository<CatalogRegion, String> {
    List<CatalogRegion> findByAvailabilityNotOrderBySortOrderAsc(String availability);

    List<CatalogRegion> findAllByOrderBySortOrderAsc();
}
