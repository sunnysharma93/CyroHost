package com.cyrohost.console.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catalog_plans")
public class CatalogPlan {

    @Id
    private String id;

    @Column(nullable = false, length = 40)
    private String name;

    @Column(nullable = false, length = 32)
    private String priceLabel;

    @Column(nullable = false)
    private int cpu;

    @Column(nullable = false)
    private int ramGb;

    @Column(nullable = false)
    private int diskGb;

    @Column(nullable = false, length = 32)
    private String transfer;

    @Column(nullable = false, length = 32)
    private String port;

    @Column(nullable = false)
    private boolean windowsAllowed;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private int sortOrder;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPriceLabel() {
        return priceLabel;
    }

    public void setPriceLabel(String priceLabel) {
        this.priceLabel = priceLabel;
    }

    public int getCpu() {
        return cpu;
    }

    public void setCpu(int cpu) {
        this.cpu = cpu;
    }

    public int getRamGb() {
        return ramGb;
    }

    public void setRamGb(int ramGb) {
        this.ramGb = ramGb;
    }

    public int getDiskGb() {
        return diskGb;
    }

    public void setDiskGb(int diskGb) {
        this.diskGb = diskGb;
    }

    public String getTransfer() {
        return transfer;
    }

    public void setTransfer(String transfer) {
        this.transfer = transfer;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public boolean isWindowsAllowed() {
        return windowsAllowed;
    }

    public void setWindowsAllowed(boolean windowsAllowed) {
        this.windowsAllowed = windowsAllowed;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
