package com.tabish.ps18.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("E-Commerce Inventory Service API")
                        .version("1.0.0")
                        .description("""
                                Auto-generated API documentation for the E-Commerce Inventory Service.
                                
                                **Business Context:** This service manages the product catalog, inventory tracking,
                                and order processing for the e-commerce platform. It serves as the single source
                                of truth for product availability and pricing.
                                
                                **Key Features:**
                                - Product CRUD with category management
                                - Real-time inventory tracking
                                - Order lifecycle management
                                - Business rule enforcement (stock validation, pricing rules)
                                """)
                        .contact(new Contact()
                                .name("API Team")
                                .email("api-team@company.com"))
                        .license(new License()
                                .name("Internal Use Only")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development Server")
                ));
    }
}
