@echo off
title AZIMXON.HUB Ishga Tushirish
echo ===================================================
echo     AZIMXON.HUB - Raqamli Marketplace Platformasi
echo ===================================================
echo.
echo Veb-ilova brauzerda ochilmoqda...

set "FILE_PATH=%~dp0index.html"

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%FILE_PATH%"
    exit /b
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%FILE_PATH%"
    exit /b
)

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "%FILE_PATH%"
    exit /b
)

start "" "%FILE_PATH%"
exit /b
