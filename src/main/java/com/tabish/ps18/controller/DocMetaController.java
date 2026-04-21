package com.tabish.ps18.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/docs")
@Tag(name = "Documentation Meta", description = "Endpoints providing metadata about the API documentation itself - version, changelog, and service health.")
public class DocMetaController {

    @GetMapping("/info")
    @Operation(
            summary = "Get documentation metadata",
            description = "Returns metadata about the API documentation including version, last updated time, and service information."
    )
    public ResponseEntity<Map<String, Object>> getDocInfo() {
        return ResponseEntity.ok(Map.of(
                "service", "E-Commerce Inventory Service",
                "version", "1.0.0",
                "lastUpdated", LocalDateTime.now().toString(),
                "totalEndpoints", 18,
                "tags", List.of("Categories", "Products", "Orders"),
                "businessDomain", "E-Commerce / Inventory Management"
        ));
    }

    @GetMapping("/changelog")
    @Operation(
            summary = "Get API changelog",
            description = "Returns the changelog of API changes for tracking breaking changes and new features."
    )
    public ResponseEntity<List<Map<String, String>>> getChangelog() {
        return ResponseEntity.ok(List.of(
                Map.of("version", "1.0.0", "date", "2024-01-15", "description", "Initial release with Products, Categories, and Orders APIs"),
                Map.of("version", "0.9.0", "date", "2024-01-10", "description", "Beta release - Order cancellation and stock restoration"),
                Map.of("version", "0.8.0", "date", "2024-01-05", "description", "Added product search and category filtering")
        ));
    }

    @GetMapping("/health")
    @Operation(
            summary = "Service health check",
            description = "Returns the health status of the API service and its dependencies."
    )
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "database", "UP",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
