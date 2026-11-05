import tempfile
import unittest
from pathlib import Path
from server.production import create_app
from test_accounts import Client


class ProductionTest(unittest.TestCase):
    def test_requires_explicit_https_and_data_folder(self):
        for config in [{}, {'GRAMMAR_PUBLIC_ORIGIN':'http://example.test'},
                       {'GRAMMAR_PUBLIC_ORIGIN':'https://example.test/path'},
                       {'GRAMMAR_PUBLIC_ORIGIN':'https://user:secret@example.test'},
                       {'GRAMMAR_PUBLIC_ORIGIN':'https://example.test','GRAMMAR_DATA_DIR':'relative'}]:
            with self.assertRaises(ValueError):
                create_app(config)

    def test_network_mode_and_secure_cookie(self):
        with tempfile.TemporaryDirectory() as folder:
            app = create_app({'GRAMMAR_PUBLIC_ORIGIN':'https://grammar.example.test',
                              'GRAMMAR_DATA_DIR':folder})
            client = Client(app)
            self.assertEqual(client.get('/api/health')[1], {'ok':True})
            info = client.get('/api/auth/info')[1]
            self.assertFalse(info['demo']); self.assertFalse(info['local'])
            result = client.request('/api/auth/setup', {
                'name':'Учитель', 'email':'teacher@example.test',
                'password':'Example-password-2026',
                'code':Path(folder,'owner-setup-code.txt').read_text()
            }, origin='https://grammar.example.test')
            self.assertEqual(result[0],200,result[1])
            self.assertIn('; Secure',result[2]['Set-Cookie'])
            self.assertEqual(client.post('/api/auth/logout',{})[0],403)


if __name__ == '__main__':
    unittest.main()
