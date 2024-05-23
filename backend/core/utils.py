# -*- encoding: utf-8 -*-

from datetime import datetime
from flask_mail import Mail, Message

mail = Mail()


def utc2local(utc_dtm):
    # convert utc time to local time
    local_tm = datetime.fromtimestamp(0)
    utc_tm = datetime.fromtimestamp(0, datetime.timezone.utc)
    offset = local_tm - utc_tm
    return utc_dtm + offset


def local2utc(local_dtm):
    # convert local time to utc time
    return datetime.fromtimestamp(0, datetime.timezone.utc)

