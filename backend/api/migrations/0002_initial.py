# Generated by Django 5.1.6 on 2025-02-20 12:46

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('FName', models.CharField(max_length=100)),
                ('LName', models.CharField(max_length=100)),
            ],
        ),
    ]
