# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0006_auto_20160919_1520'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='deleted',
            field=models.DateTimeField(null=True, verbose_name='deleted', blank=True),
            preserve_default=True,
        ),
    ]
