"""Single-instance SQLite deployment behind a host's HTTPS proxy."""
import os

bind = '0.0.0.0:' + str(int(os.environ.get('PORT', '10000')))
workers = 1
worker_class = 'gthread'
threads = 4
timeout = 60
graceful_timeout = 30
umask = 0o077
accesslog = '-'
# Do not log cookies, authorization headers, query strings or request bodies.
access_log_format = '%(m)s %(U)s %(s)s %(L)s'
errorlog = '-'
preload_app = False
