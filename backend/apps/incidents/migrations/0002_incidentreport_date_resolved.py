from django.db import migrations, models


class Migration(migrations.Migration):
    """Adds the closing timestamp that time-to-resolve is measured from."""

    dependencies = [
        ('incidents', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='incidentreport',
            name='date_resolved',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
