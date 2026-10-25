"""Server-side SMS delivery through an optional Twilio account."""
import base64
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from config import Config


class SmsDeliveryError(Exception):
    """Raised when the SMS provider cannot accept a message."""


def is_sms_configured():
    return bool(
        Config.TWILIO_ACCOUNT_SID
        and Config.TWILIO_AUTH_TOKEN
        and Config.TWILIO_FROM_NUMBER
    )


def send_sms(recipient, message):
    if not is_sms_configured():
        raise SmsDeliveryError('SMS delivery is not configured.')

    account_sid = Config.TWILIO_ACCOUNT_SID
    credentials = base64.b64encode(
        f'{account_sid}:{Config.TWILIO_AUTH_TOKEN}'.encode('utf-8')
    ).decode('ascii')
    request = Request(
        f'https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json',
        data=urlencode({
            'To': recipient,
            'From': Config.TWILIO_FROM_NUMBER,
            'Body': message,
        }).encode('utf-8'),
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        method='POST',
    )

    try:
        with urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (HTTPError, URLError, TimeoutError, ValueError) as error:
        raise SmsDeliveryError('The SMS provider could not accept this message.') from error

    if not isinstance(payload, dict) or not isinstance(payload.get('sid'), str):
        raise SmsDeliveryError('The SMS provider returned an invalid response.')
    return {'sid': payload['sid'], 'status': payload.get('status', 'accepted')}