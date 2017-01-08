from datetime import datetime
from time import mktime
import sys

import click
import feedparser
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
                url=data['canonical_url'] or url,
                title=data['title'],
                content=data['text'],
                summary=data['summary'],
            )
            log.info('Article-{} has been created'.format(article.id))
        except IntegrityError:
            log.warn('Article for URL {} already exists'.format(
                data['canonical_url']))


@cli.command()
@click.argument('feed_url')
def import_feed(feed_url):
    """Imports an RSS feed."""

    app = create_app(__name__)
    with app.app_context():

        d = feedparser.parse(feed_url)
        for entry in d.entries:
            link, title, published = \
                [entry[k] for k in ['link', 'title', 'published_parsed']]

            try:
                data = summarize_url(link)
            except:
                continue

            published = datetime.fromtimestamp(mktime(published))
            url = data['canonical_url'] or data['url'] or link

            try:
                article = Article.create(
                    fetched_at=datetime.utcnow(),
                    published_at=published,
                    channel=None,
                    url=url,
                    title=data['title'],
                    content=data['text'],
                    summary=data['summary'],
                )
                log.info('Article-{} has been created'.format(article.id))
            except IntegrityError:
                log.warn('Article for URL {} already exists'.format(url))
                db.session.rollback()


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
