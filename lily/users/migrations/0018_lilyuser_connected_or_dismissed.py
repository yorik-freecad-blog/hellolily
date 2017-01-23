# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


def set_connected_or_dismissed(apps, schema_editor):
    User = apps.get_model('users', 'LilyUser')

    for user in User.objects.all():
        user.update_modified = False
        user.connected_or_dismissed = True
        user.save()


def do_nothing(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_auto_20161125_1611'),
    ]

    operations = [
        migrations.AddField(
            model_name='lilyuser',
            name='connected_or_dismissed',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(set_connected_or_dismissed, do_nothing),
    ]
