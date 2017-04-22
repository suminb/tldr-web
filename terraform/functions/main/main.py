from flask import Flask, request


app = Flask(__name__)


@app.route('/hello', methods=['GET', 'POST'])
def handler(event, context):
    with app.app_context():
        return 'request = {}'.format(request)
