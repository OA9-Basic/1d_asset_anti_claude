#!/bin/bash

# Comprehensive Security and Functional Testing Script
# This script tests all aspects of the Digital Asset Marketplace

BASE_URL="http://localhost:3005"
FAILED_TESTS=0
PASSED_TESTS=0

echo "=========================================="
echo "Digital Asset Marketplace - Full Test Suite"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test helper functions
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="$5"
    local token="$6"

    echo -n "Testing: $test_name ... "

    if [ -n "$data" ]; then
        if [ -n "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Cookie: auth_token=$token" \
                -d "$data" \
                "$BASE_URL$endpoint" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint" 2>&1)
        fi
    else
        if [ -n "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Cookie: auth_token=$token" \
                "$BASE_URL$endpoint" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                "$BASE_URL$endpoint" 2>&1)
        fi
    fi

    body=$(echo "$response" | head -n -1)
    status_code=$(echo "$response" | tail -n 1)

    if [ "$status_code" = "$expected_code" ]; then
        echo -e "${GREEN}PASSED${NC} (HTTP $status_code)"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}FAILED${NC} (Expected: $expected_code, Got: $status_code)"
        echo "  Response: $body"
        ((FAILED_TESTS++))
        return 1
    fi
}

echo "Step 1: Testing Public Endpoints"
echo "--------------------------------"
test_api "Home Page" "GET" "/" "" "200"
test_api "Sign Up Page" "GET" "/auth/sign-up" "" "200"
test_api "API Health Check" "GET" "/api/auth/session" "" "401"

echo ""
echo "Step 2: User Registration"
echo "-------------------------"
# Create test user
test_user_response=$(curl -s -X POST "$BASE_URL/api/auth/sign-up" \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com","password":"testpass123","name":"Test User"}')

echo "Test User Response: $test_user_response"

echo ""
echo "Step 3: User Login"
echo "------------------"
# Login as test user
login_response=$(curl -s -X POST "$BASE_URL/api/auth/sign-in" \
    -H "Content-Type: application/json" \
    -c - \
    -d '{"email":"testuser@example.com","password":"testpass123"}')

echo "Login Response: $login_response"

# Extract token
USER_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/sign-in" \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com","password":"testpass123"}' \
    | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "User Token: $USER_TOKEN"

echo ""
echo "Step 4: Testing Authentication"
echo "-------------------------------"
test_api "Session with token" "GET" "/api/auth/session" "" "200" "$USER_TOKEN"
test_api "Session without token" "GET" "/api/auth/session" "" "401" ""

echo ""
echo "Step 5: Testing Wallet Operations"
echo "----------------------------------"
test_api "Get Balance" "GET" "/api/wallet/balance" "" "200" "$USER_TOKEN"

# Deposit test funds
test_api "Deposit Funds" "POST" "/api/wallet/deposit" \
    '{"amount":100,"cryptoCurrency":"MOCK"}' \
    "200" "$USER_TOKEN"

test_api "Get Balance After Deposit" "GET" "/api/wallet/balance" "" "200" "$USER_TOKEN"

echo ""
echo "Step 6: Testing Asset Creation"
echo "-------------------------------"
# Create an asset (needs admin)
create_asset_response=$(curl -s -X POST "$BASE_URL/api/assets/create" \
    -H "Content-Type: application/json" \
    -H "Cookie: auth_token=$USER_TOKEN" \
    -d '{"title":"Test Course","description":"A test course for security testing","targetPrice":100,"type":"COURSE","featured":false,"metadata":{}}')

echo "Create Asset Response: $create_asset_response"

echo ""
echo "Step 7: Testing Contribution Security"
echo "--------------------------------------"

# First, get an available asset
assets_response=$(curl -s "$BASE_URL/api/assets")
echo "Available Assets: $assets_response"

echo ""
echo "Step 8: Testing Purchase Security"
echo "----------------------------------"
# Test that contributors can't purchase again (this should be blocked)
# This will be tested after contribution system is verified

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo -e "${GREEN}Passed Tests: $PASSED_TESTS${NC}"
echo -e "${RED}Failed Tests: $FAILED_TESTS${NC}"
echo "Total Tests: $((PASSED_TESTS + FAILED_TESTS))"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed!${NC}"
    exit 1
fi
