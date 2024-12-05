# Local DynamoDB Testing Setup

## Commands

1. Start LocalStack:
```bash
docker compose up
```

2. Create table and insert sample data:

```bash
python setup_local.py
```

3. Test Lambda function:

```shell
LOCAL_TESTING=true DYNAMODB_TABLE=GameScores AWS_ENDPOINT_URL=http://localhost:4566  python-lambda-local -f lambda_handler -t 5 app.py event.json
```

and post something to it:

```shell
LOCAL_TESTING=true DYNAMODB_TABLE=GameScores AWS_ENDPOINT_URL=http://localhost:4566  python-lambda-local -f lambda_handler -t 5 app.py event_post.json
```

4. To verify table contents:

```shell
python local_list_query.py
```

5. Run in SAM

```shell
sam local start-api --docker-network lambda-local
```

To test it:

```shell
curl -X GET http://127.0.0.1:3000/high-scores
```


5. To stop LocalStack:

```shell
docker-compose down
```
