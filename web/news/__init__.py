from flask import Blueprint, render_template, request
# from werkzeug.exceptions import BadRequest

from web.news.models import Article


news_module = Blueprint('news', __name__, template_folder='templates')


@news_module.route('/')
def list_articles():
    page = int(request.args.get('page', 1))

    articles = Article.get_entries(
        order_by=Article.fetched_at.desc(), page=page - 1)
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
