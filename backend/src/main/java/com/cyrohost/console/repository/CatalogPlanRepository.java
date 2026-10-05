package com.cyrohost.console.repository;

import com.cyrohost.console.entity.CatalogPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogPlanRepository extends JpaRepository<CatalogPlan, String> {
    List<CatalogPlan> findByActiveTrueOrderBySortOrderAsc();

    List<CatalogPlan> findAllByOrderBySortOrderAsc();
}
