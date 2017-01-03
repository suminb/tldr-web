from flask import Blueprint, render_template, request
from werkzeug.exceptions import BadRequest

from web.news.models import Article


MAX_LIMIT = 100


news_module = Blueprint('news', __name__, template_folder='templates')


@news_module.route('/')
def list_articles():
    limit = int(request.args.get('limit', 10))
    # TODO: Make some sort of filter
    limit = max(0, min(limit, MAX_LIMIT))

    articles = Article.query.order_by(Article.fetched_at.desc()).limit(limit)
    context = {
        'articles': articles,
    }
    return render_template('list_articles.html', **context)


@news_module.route('/<int:article_id>')
def view_article(article_id):
    article = Article.get_or_404(article_id)
    context = {
        'article': article,
    }
    return render_template('view_article.html', **context)
