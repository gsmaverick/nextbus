import os, re
from twilio.rest import TwilioRestClient

TWILIO_ACCOUNT = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')

# Contents of the SMS that will be sent out to the user.
MESSAGE = 'Find next bus times by going to http://www.bustickerapp.com'

# Number to send the SMS message from.
FROM_NUMBER = '12892041646'

def sendToNumber(number):
    """
        Sends an SMS message promoting Next Bus to the specified phone number
        through Twilio's SMS service.

        :param number: Phone number to send the message to.
    """
    error = sms = None

    if _isValidNumber(number) == True:
        error = _createMessage(number)
    else:
        error = 'Invalid phone number.'

    return {
        'status': 'error' if error else 'success',
        'text': error if error else 'Successfully sent message.'
    }

def _isValidNumber(number):
    """
        Checks if the number is a valid phone number and that we haven't sent a
        message to this number previously.
    """
    if not re.match('^[0-9]{10,11}$', number):
        return 'Invalid phone number.'

    return True

def _createMessage(number):
    """
        Creates and sends a Twilio SMS message.  Returns an error string if the
        message failed to send, None if sms was successfully delivered.

        :param number: Phone number to send message to.
    """
    client = TwilioRestClient(TWILIO_ACCOUNT, TWILIO_TOKEN)

    sms = client.sms.messages.create(
        to=number,
        from_=FROM_NUMBER,
        body=MESSAGE)

    if sms.status == 'failed':
        return 'Message failed to send, please try again.'