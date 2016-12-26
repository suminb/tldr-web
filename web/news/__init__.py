import os

from flask import Blueprint, render_template, request
import requests
from werkzeug.exceptions import BadRequest


news_module = Blueprint('news', __name__, template_folder='templates')


@news_module.route('/')
def news_home():
    return 'News home'
