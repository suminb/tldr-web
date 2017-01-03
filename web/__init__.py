import os

from flask import Flask


__version__ = '0.1.5'


def create_app(name=__name__):
    app = Flask(name)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DB_URI']

    from web.main import main_module
    from web.news import news_module

    app.register_blueprint(main_module, url_prefix='/')
    app.register_blueprint(news_module, url_prefix='/news')

    from web.news.models import db
    db.init_app(app)

    return app


app = create_app()


if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8005))
    debug = bool(os.environ.get('DEBUG', False))
    app.run(host=host, port=port, debug=debug)
