from datetime import datetime
import sys

import click
from logbook import Logger, StreamHandler
from sqlalchemy.exc import IntegrityError

from web import create_app
from web.main import summarize_url
from web.news.models import Article, db


log = Logger(__name__)
log.handlers.append(StreamHandler(sys.stdout, level='INFO'))


@click.group()
def cli():
    pass


@cli.command()
@click.argument('url')
def import_article(url):
    data = summarize_url(url)

    app = create_app(__name__)
    with app.app_context():
        try:
            article = Article.create(
                fetched_at=datetime.utcnow(),
                channel=None,
                url=data['canonical_url'],
                title=data['title'],
                content=data['text'],
                summary=data['summary'],
            )
            log.info('Article-{} has been created'.format(article.id))
        except IntegrityError:
            log.warn('Article for URL {} already exists'.format(
                data['canonical_url']))


@cli.command()
def create_all():
    app = create_app(__name__)
    with app.app_context():
        db.create_all()


@cli.command()
def drop_all():
    app = create_app(__name__)
    with app.app_context():
        db.drop_all()


if __name__ == '__main__':
    cli()
