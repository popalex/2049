# Local DynamoDB Testing Setup

## Commands

1. Start LocalStack:
```bash
docker-compose up -d
```

2. Create table and insert sample data:

```bash
python setup_local.py
```

3. Test Lambda function:

```shell
LOCAL_TESTING=true DYNAMODB_TABLE=high-scores-table python-lambda-local -f lambda_handler -t 5 app.py event.json
```

4. To verify table contents:

```shell
python local_list_query.py
```

5. To stop LocalStack:

```shell
docker-compose down
```
