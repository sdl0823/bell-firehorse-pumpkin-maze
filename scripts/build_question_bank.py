"""Compatibility entry point: build the current 300-question release bank."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('expand_bank_300.py')), run_name='__main__')
