#!/usr/bin/env python3
"""Compatibility entry point; the canonical local suite is npm test."""
from pathlib import Path
import subprocess
import sys
sys.exit(subprocess.call(['npm', 'test'], cwd=Path(__file__).resolve().parents[1]))
