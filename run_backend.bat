@echo off
title SmartSort - Backend AI Server (FastAPI)
echo ====================================================
echo     SMARTSORT IoT - FASTAPI BACKEND & AI SERVER
echo ====================================================
cd /d "%~dp0backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
