#!/bin/bash
# ============================================================
# Auto API Documentation - One-Click Integration Script
# ============================================================
# Usage: ./integrate.sh /path/to/your/existing/spring-boot-project
# ============================================================

set -e

PROJECT_PATH="$1"

if [ -z "$PROJECT_PATH" ]; then
    echo ""
    echo "  Auto API Documentation - Integration Tool"
    echo "  =========================================="
    echo ""
    echo "  Usage: ./integrate.sh /path/to/your/spring-boot-project"
    echo ""
    echo "  What this does:"
    echo "    1. Adds springdoc-openapi dependency to your pom.xml"
    echo "    2. Registers your service with the documentation portal"
    echo ""
    echo "  Prerequisites:"
    echo "    - Your project must be a Maven-based Spring Boot project"
    echo "    - The documentation portal must be running (port 8080)"
    echo ""
    exit 1
fi

POM_FILE="$PROJECT_PATH/pom.xml"

if [ ! -f "$POM_FILE" ]; then
    echo "ERROR: pom.xml not found at $POM_FILE"
    exit 1
fi

echo ""
echo "  Integrating: $PROJECT_PATH"
echo "  =========================="
echo ""

# Step 1: Check if springdoc is already present
if grep -q "springdoc-openapi" "$POM_FILE"; then
    echo "  [OK] SpringDoc dependency already present"
else
    echo "  [+] Adding SpringDoc OpenAPI dependency..."

    # Detect Spring Boot version to choose correct dependency
    if grep -q "spring-boot-starter-parent" "$POM_FILE"; then
        BOOT_VERSION=$(grep -A2 "spring-boot-starter-parent" "$POM_FILE" | grep "version" | head -1 | sed 's/.*<version>\(.*\)<\/version>.*/\1/')
        MAJOR_VERSION=$(echo "$BOOT_VERSION" | cut -d. -f1)

        if [ "$MAJOR_VERSION" -ge 3 ]; then
            # Spring Boot 3.x
            DEPENDENCY='    <dependency>\n      <groupId>org.springdoc</groupId>\n      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>\n      <version>2.3.0</version>\n    </dependency>'
        else
            # Spring Boot 2.x
            DEPENDENCY='    <dependency>\n      <groupId>org.springdoc</groupId>\n      <artifactId>springdoc-openapi-ui</artifactId>\n      <version>1.7.0</version>\n    </dependency>'
        fi

        # Insert dependency before </dependencies>
        sed -i.bak "s|</dependencies>|$DEPENDENCY\n  </dependencies>|" "$POM_FILE"
        rm -f "${POM_FILE}.bak"
        echo "  [OK] SpringDoc dependency added (Boot $BOOT_VERSION detected)"
    else
        echo "  [!] Could not detect Spring Boot version. Please add manually:"
        echo "      <dependency>"
        echo "        <groupId>org.springdoc</groupId>"
        echo "        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>"
        echo "        <version>2.3.0</version>"
        echo "      </dependency>"
    fi
fi

echo ""
echo "  =========================================="
echo "  Integration Complete!"
echo "  =========================================="
echo ""
echo "  Next steps:"
echo "    1. Rebuild your project:  mvn clean compile"
echo "    2. Start your service"
echo "    3. Verify docs at:  http://localhost:<your-port>/api-docs"
echo "    4. Open portal at:  http://localhost:3000"
echo "    5. Click '+ Connect' and paste your /api-docs URL"
echo ""
echo "  Optional: Add @Operation annotations to enrich docs with business context"
echo "  See INTEGRATION_GUIDE.md for details"
echo ""
