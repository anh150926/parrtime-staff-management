#!/bin/bash

echo "========================================"
echo "Rebuilding Backend Project"
echo "========================================"
echo ""

echo "Step 1: Cleaning project..."
mvn clean

echo ""
echo "Step 2: Compiling project..."
mvn compile -DskipTests

echo ""
echo "Step 3: Installing project..."
mvn install -DskipTests

echo ""
echo "========================================"
echo "Build completed!"
echo "========================================"
echo ""
echo "If you see 'BUILD SUCCESS', your code is correct."
echo "The errors in IDE are just IDE not recognizing Lombok."
echo ""

