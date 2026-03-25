#!/bin/bash
# deploy.sh — Trigger Vercel production redeploy
# Vercel points directly at the primary Ghost DB (ogkhke7n6o).
# No forking needed. Just push to main or run this script.

npx vercel --prod --force
