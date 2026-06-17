#!/bin/bash
echo "========================================"
echo "  ImuniKids - Setup & Build APK"
echo "  by Zeetasi"
echo "========================================"

echo ""
echo "[1/4] Install npm dependencies..."
npm install --legacy-peer-deps

echo ""
echo "[2/4] Install EAS CLI..."
npm install -g eas-cli

echo ""
echo "[3/4] Login ke akun Expo..."
echo "Daftar gratis di https://expo.dev kalau belum punya akun"
eas login

echo ""
echo "[4/4] Build APK (proses di cloud ~15 menit)..."
eas build -p android --profile preview

echo ""
echo "========================================"
echo "Selesai! Cek link APK di atas."
echo "========================================"
