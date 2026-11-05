"""Explicit network configuration. No local database or demo fallback."""
import os
from pathlib import Path
from urllib.parse import urlsplit
from .app import GrammarApp


def create_app(config=None):
    config = os.environ if config is None else config
    origin = config.get('GRAMMAR_PUBLIC_ORIGIN', '').strip().rstrip('/')
    url = urlsplit(origin)
    if (url.scheme != 'https' or not url.hostname or url.username or url.password
            or url.path or url.query or url.fragment):
        raise ValueError('GRAMMAR_PUBLIC_ORIGIN must be the exact public HTTPS origin.')
    folder = config.get('GRAMMAR_DATA_DIR', '')
    if not folder or not Path(folder).is_absolute():
        raise ValueError('GRAMMAR_DATA_DIR must be an explicit absolute persistent directory.')
    return GrammarApp(folder, origin=origin, demo=False)
