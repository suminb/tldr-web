from datetime import datetime

import click

from web import create_app
from web.main import summarize_url
from web.news.models import Article, db


@click.group()
def cli():
    pass


@cli.command()
@click.argument('url')
def import_article(url):
    data = summarize_url(url)

    app = create_app(__name__)
    with app.app_context():
        Article.create(
            fetched_at=datetime.utcnow(),
            channel=None,
            url=url,
            title=data['title'],
            content=data['text'],
            summary=data['summary'],
        )


@cli.command()
def create_all():
    app = create_app(__name__)
    with app.app_context():
        db.create_all()


if __name__ == '__main__':
    cli()
