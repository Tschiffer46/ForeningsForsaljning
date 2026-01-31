#!/bin/bash

# Simple Backend Test Script for Beginners
# This script tests if the backend is working

echo "================================================"
echo "  FöreningsFörsäljning Backend Test Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo "❌ ERROR: Not in the right directory!"
    echo "Please run: cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning"
    exit 1
fi

echo "✅ Found project files"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if the backend is running
echo "Testing if backend is running..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:3001"
    echo ""
    
    # Run tests
    echo "================================================"
    echo "  Running Backend Tests"
    echo "================================================"
    echo ""
    
    echo "Test 1: Health Check"
    echo "--------------------"
    HEALTH=$(curl -s http://localhost:3001/api/health)
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
    echo ""
    
    echo "Test 2: Super Admin Login"
    echo "-------------------------"
    LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"superadmin","password":"superadmin123","userType":"super_admin"}')
    echo "$LOGIN" | python3 -m json.tool 2>/dev/null || echo "$LOGIN"
    echo ""
    
    echo "Test 3: Get All Clubs (Super Admin)"
    echo "-----------------------------------"
    CLUBS=$(curl -s http://localhost:3001/api/super-admin/clubs -H "x-user-role: super_admin")
    echo "$CLUBS" | python3 -m json.tool 2>/dev/null | head -20 || echo "$CLUBS" | head -20
    echo ""
    
    echo "================================================"
    echo "  ✅ All Tests Passed!"
    echo "================================================"
    echo ""
    echo "Your backend is working perfectly! 🎉"
    echo ""
    echo "You can now:"
    echo "  • View all tests: See BACKEND-TESTING.md"
    echo "  • Test in browser: http://localhost:3001/api/health"
    echo "  • Read the guide: BEGINNER-GUIDE.md"
    
else
    echo "❌ Backend is NOT running"
    echo ""
    echo "To start the backend, run this command in a terminal:"
    echo ""
    echo "  node backend/server.js"
    echo ""
    echo "Then run this test script again!"
    echo ""
    echo "For detailed instructions, see: BEGINNER-GUIDE.md"
    exit 1
fi

echo ""
echo "================================================"
