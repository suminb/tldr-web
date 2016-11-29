import os

from flask import Blueprint, render_template, request
import requests
from werkzeug.exceptions import BadRequest


main_module = Blueprint('main', __name__, template_folder='templates')


@main_module.route('/', methods=['GET', 'POST'])
@main_module.route('text', methods=['GET', 'POST'])
def text():
    text = request.form.get('text')
    sample = load_sample_text()
    def get():
        context = {
            'sample': sample,
            'text': text,
        }
        return render_template('text.html', **context)

    def post():
        summary = summarize_text(text)

        if is_plain_text_requested(request.accept_mimetypes):
            return summary
        else:
            context = {
                'text': text,
                'summary': summary,
            }
            return render_template('text.html', **context)

    handler = get_handler(request.method, locals())
    return handler()


@main_module.route('url', methods=['GET', 'POST'])
def url():
    url = request.args.get('url', None)

    context = {
        'url': url,
    }

    if url is not None:
        context['text'] = summarize_url(url)

    return render_template('url.html', **context)


@main_module.route('fetch-url')
def fetch_url():
    url = request.args['url']
    method = request.args.get('method', 'get').lower()

    if method != 'get':
        raise BadRequest("Request method '{}' is not supported".format(method))

    request_func = getattr(requests, method)
    # TODO: Support passing parameters
    resp = request_func(url)

    return resp.text


def load_sample_text():
    base_path = os.path.dirname(__file__)
    with open(os.path.join(base_path, 'sample1.txt')) as fin:
        return fin.read()


def is_plain_text_requested(accept_mimetypes):
    best = accept_mimetypes.best_match(['text/plain'])
    return best == 'text/plain' and \
        accept_mimetypes[best] > accept_mimetypes['text/html']


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
def summarize_url(url):
    backend_endpoint = os.environ['BACKEND_ENDPOINT']
    request_url = '{}/api/v1/summarize_url'.format(backend_endpoint)
    data = {
        'url': url,
    }
    resp = requests.post(request_url, data=data)
    return resp.text


def summarize_text(text):
    backend_endpoint = os.environ['BACKEND_ENDPOINT']
    request_url = '{}/api/v1/summarize'.format(backend_endpoint)
    data = {
        'text': text,
    }
    resp = requests.post(request_url, data=data)
    return resp.text
