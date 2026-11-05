"""Local autonomous Grammar NOEON server. Never loads another app's environment."""
import argparse
import tempfile
from pathlib import Path
from wsgiref.simple_server import make_server
from socketserver import ThreadingMixIn
from wsgiref.simple_server import WSGIServer
from server.app import GrammarApp

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=4177)
    parser.add_argument('--demo',action='store_true')
    parser.add_argument('--data-dir',type=Path)
    args=parser.parse_args()
    if not args.demo and not args.data_dir:parser.error('Provide an explicit NEW --data-dir, or use --demo for an isolated temporary database.')
    if args.demo and args.data_dir:parser.error('--demo always uses a new temporary database; do not provide --data-dir.')
    temp=tempfile.TemporaryDirectory(prefix='grammar-noeon-demo-') if args.demo else None
    folder=Path(temp.name) if temp else args.data_dir
    app=GrammarApp(folder,origin='http://127.0.0.1:'+str(args.port),demo=args.demo)
    if args.demo:app.seed_preview_history()
    class ThreadedServer(ThreadingMixIn,WSGIServer):daemon_threads=True
    print('Grammar NOEON: http://127.0.0.1:'+str(args.port)+'/#profile',flush=True)
    if not args.demo and not app.teacher_exists():print('Owner setup code: '+str(folder/'owner-setup-code.txt'),flush=True)
    try:
        with make_server('127.0.0.1',args.port,app,server_class=ThreadedServer) as server:server.serve_forever()
    finally:
        if temp:temp.cleanup()
if __name__=='__main__':main()
