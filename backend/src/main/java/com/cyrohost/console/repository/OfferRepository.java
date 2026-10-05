package com.cyrohost.console.repository;

import com.cyrohost.console.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfferRepository extends JpaRepository<Offer, UUID> {
    List<Offer> findByActiveTrueOrderByTitleAsc();
    Optional<Offer> findByCodeIgnoreCaseAndActiveTrue(String code);
}
