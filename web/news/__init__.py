import os

from flask import Blueprint, render_template, request
import requests
from werkzeug.exceptions import BadRequest

from web.news.models import Article


news_module = Blueprint('news', __name__, template_folder='templates')


@news_module.route('/')
def news_home():
    return 'News home'


@news_module.route('/<int:article_id>')
def view_article(article_id):
    article = Article.get_or_404(article_id)
    context = {
        'article': article,
    }
    return render_template('view_article.html', **context)
