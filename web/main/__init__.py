import os

from flask import Blueprint, render_template, request
import requests


main_module = Blueprint('main', __name__, template_folder='templates')


@main_module.route('/')
@main_module.route('/url')
def summarize_url():
    url = request.args.get('url', None)

    context = {
        'url': url,
    }

    if url is not None:
        context['text'] = __summarize_url__(url)

    return render_template('index.html', **context)


@main_module.route('/text')
def summarize_text():
    def get():
        return render_template('index.html')

    def post():
        text = request.form['text']

        # TODO: Summarize text

        context = {
            'text': text,
        }
        return render_template('index.html', **context)

    handler = get_handler(request.method, locals())
    return handler()


# TODO: Move this elsewhere
def get_handler(method, local_vars):
    if is_valid_method(method):
        return local_vars[method.lower()]
    else:
        raise ValueError('Invalid method: {}'.format(method))


# TODO: Move this elsewhere
def is_valid_method(method, valid_methods=['GET', 'POST']):
    return method.upper() in valid_methods


# TODO: Move this elsewhere
def __summarize_url__(url):
    backend_endpoint = os.environ['BACKEND_ENDPOINT']
    request_url = '{}/api/v1/summarize_url'.format(backend_endpoint)
    data = {
        'url': url,
    }
    resp = requests.post(request_url, data=data)
    return resp.text
