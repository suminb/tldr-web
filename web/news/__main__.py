import click

from web import create_app
from web.main import summarize_url
from web.news.models import db


@click.group()
def cli():
    pass


@cli.command()
@click.argument('url')
def import_article(url):
    summary = summarize_url(url)
    print(summary)


@cli.command()
def create_all():
    app = create_app(__name__)
    with app.app_context():
        db.create_all()


if __name__ == '__main__':
    cli()
