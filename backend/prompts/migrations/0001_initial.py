from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id',   models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Prompt',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('title',      models.CharField(max_length=200)),
                ('content',    models.TextField()),
                ('complexity', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tags',       models.ManyToManyField(blank=True, related_name='prompts', to='prompts.tag')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
