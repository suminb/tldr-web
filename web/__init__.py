import os

from flask import Flask


__version__ = '0.1.2'


def create_app(name=__name__):
    app = Flask(name)

    from web.main import main_module

    app.register_blueprint(main_module, url_prefix='/')

    return app


app = create_app()


if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8005))
    debug = bool(os.environ.get('DEBUG', False))
    app.run(host=host, port=port, debug=debug)
