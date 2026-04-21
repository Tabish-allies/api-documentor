package com.tabish.ps18.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/registry")
@Tag(name = "Service Registry", description = "Register and manage API services for documentation aggregation. One-click integration for any service with an OpenAPI/Swagger endpoint.")
public class RegistryController {

    private final Map<String, Map<String, Object>> services = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/connect")
    @Operation(
            summary = "Connect a service (One-Click Integration)",
            description = "Register any existing service that has a Swagger/OpenAPI endpoint. Just provide the service URL and the portal will auto-fetch and display its documentation."
    )
    public ResponseEntity<?> connectService(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String apiDocsUrl = body.get("apiDocsUrl");
        String description = body.getOrDefault("description", "");

        if (name == null || apiDocsUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "name and apiDocsUrl are required"));
        }

        try {
            // Fetch the OpenAPI spec to validate the URL
            String spec = restTemplate.getForObject(apiDocsUrl, String.class);
            if (spec == null || !spec.contains("openapi")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OpenAPI spec at the provided URL"));
            }

            Map<String, Object> serviceInfo = new HashMap<>();
            serviceInfo.put("name", name);
            serviceInfo.put("apiDocsUrl", apiDocsUrl);
            serviceInfo.put("description", description);
            serviceInfo.put("registeredAt", new Date().toString());
            serviceInfo.put("status", "CONNECTED");

            services.put(name, serviceInfo);

            return ResponseEntity.ok(Map.of(
                    "message", "Service connected successfully!",
                    "service", serviceInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Could not connect to service: " + e.getMessage(),
                    "hint", "Make sure the service is running and the /api-docs URL is accessible"
            ));
        }
    }

    @GetMapping("/services")
    @Operation(
            summary = "List all registered services",
            description = "Returns all services that have been connected to the documentation portal."
    )
    public ResponseEntity<List<Map<String, Object>>> listServices() {
        // Always include the local service
        Map<String, Object> localService = new HashMap<>();
        localService.put("name", "E-Commerce Inventory Service");
        localService.put("apiDocsUrl", "http://localhost:8080/api-docs");
        localService.put("description", "Sample e-commerce service (local)");
        localService.put("registeredAt", "Built-in");
        localService.put("status", "CONNECTED");

        List<Map<String, Object>> allServices = new ArrayList<>();
        allServices.add(localService);
        allServices.addAll(services.values());

        return ResponseEntity.ok(allServices);
    }

    @GetMapping("/spec")
    @Operation(
            summary = "Fetch OpenAPI spec from a registered service (proxy)",
            description = "Proxies the OpenAPI spec fetch to avoid CORS issues. The portal uses this to load specs from any registered service."
    )
    public ResponseEntity<?> fetchSpec(@RequestParam String url) {
        try {
            String spec = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(spec);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not fetch spec: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{name}")
    @Operation(
            summary = "Disconnect a service",
            description = "Removes a service from the documentation portal registry."
    )
    public ResponseEntity<?> disconnectService(@PathVariable String name) {
        if (services.remove(name) != null) {
            return ResponseEntity.ok(Map.of("message", "Service disconnected"));
        }
        return ResponseEntity.notFound().build();
    }
}
